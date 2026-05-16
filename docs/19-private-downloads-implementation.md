# 19 — Private Authenticated Installer Downloads

**Date:** 2026-05-16  
**Scope:** Website Downloads page + Flask backend + GCS  
**Phase:** 1 (manual installers, no auto-update)

---

## Architecture Overview

```
Browser (signalbridges.com/downloads)
  │
  ├─── Firebase Auth (Google sign-in)
  │           │
  │           └── Firebase ID token
  │
  ├─── GET /api/downloads/releases  ──────────────── Flask backend (Cloud Run)
  │           │ Authorization: Bearer <idToken>        │
  │           │                                        ├── verify Firebase ID token
  │           │                                        ├── check user/tenant eligibility
  │           │                                        ├── read latest.json from GCS
  │           └── { releases: [...metadata] }          └── return metadata (no URL)
  │
  └─── GET /api/downloads/{type}/{platform}  ──────── Flask backend
              │ (on Download button click)              │
              │                                        ├── verify token + authorization
              │                                        ├── read latest.json from GCS
              │                                        ├── generate v4 signed URL (15 min)
              └── { downloadUrl, version, sha256... }   └── log event (no URL in logs)
                        │
                        └── window.open(downloadUrl)  →  GCS bucket (private)
                                                               └── installer .exe
```

**Key properties:**
- GCS bucket is private; no public object URLs
- Signed URLs expire in 15 minutes and cannot be reused after that
- Backend never logs signed URLs
- Frontend never stores or hardcodes installer paths

---

## GCS Bucket Setup

### Create the bucket

```bash
gsutil mb -p algobridge-36446 -l us-central1 -b on gs://signalbridges-downloads
```

`-b on` enables uniform bucket-level access (no per-object ACLs).

### Confirm bucket is private

```bash
gsutil iam get gs://signalbridges-downloads
```

Verify there is NO `allUsers` or `allAuthenticatedUsers` binding.

### Set CORS policy (required for browser fetch of signed URLs)

Create `cors.json`:
```json
[
  {
    "origin": [
      "https://signalbridges.com",
      "https://app.signalbridges.com"
    ],
    "method": ["GET"],
    "maxAgeSeconds": 300
  }
]
```

Apply:
```bash
gsutil cors set cors.json gs://signalbridges-downloads
```

### Grant backend service account access

```bash
# Replace SA_EMAIL with your Cloud Run service account email
SA_EMAIL="your-service-account@algobridge-36446.iam.gserviceaccount.com"

gsutil iam ch serviceAccount:${SA_EMAIL}:roles/storage.objectViewer \
  gs://signalbridges-downloads

# Required for signing URLs via Workload Identity
gcloud iam service-accounts add-iam-policy-binding ${SA_EMAIL} \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/iam.serviceAccountTokenCreator" \
  --project=algobridge-36446
```

---

## Object / Folder Structure

```
signalbridges-downloads/
├── releases/
│   └── windows/
│       ├── console/
│       │   ├── latest.json
│       │   └── SignalBridge-Console-1.0.0-win-Setup.exe
│       └── runtime/
│           ├── latest.json
│           └── SignalBridge-Runtime-1.0.0-win-Setup.exe
```

---

## latest.json Schema

One file per application, updated on each new release.

```json
{
  "version": "1.0.0",
  "filename": "SignalBridge-Console-1.0.0-win-Setup.exe",
  "sha256": "a3f2c1d4e5b6a7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2",
  "sizeBytes": 89234567,
  "releaseDate": "2026-05-16",
  "notes": "Initial evaluation release."
}
```

The `filename` field must match the actual object name in the same folder.

---

## Release Upload Process

For each new release:

```bash
VERSION="1.0.1"
APP="console"     # or "runtime"
FILENAME="SignalBridge-Console-${VERSION}-win-Setup.exe"

# 1. Sign the installer (already in build pipeline)
signtool sign /fd sha256 /tr http://timestamp.digicert.com /td sha256 "${FILENAME}"

# 2. Compute SHA-256
certutil -hashfile "${FILENAME}" SHA256

# 3. Get file size in bytes
(Get-Item "${FILENAME}").length   # PowerShell

# 4. Upload installer
gsutil cp "${FILENAME}" "gs://signalbridges-downloads/releases/windows/${APP}/"

# 5. Set content type
gsutil setmeta \
  -h "Content-Type:application/octet-stream" \
  -h "Content-Disposition:attachment; filename=\"${FILENAME}\"" \
  "gs://signalbridges-downloads/releases/windows/${APP}/${FILENAME}"

# 6. Update latest.json
cat > latest.json <<EOF
{
  "version": "${VERSION}",
  "filename": "${FILENAME}",
  "sha256": "<paste hash from step 2>",
  "sizeBytes": <paste size from step 3>,
  "releaseDate": "$(date -u +%Y-%m-%d)",
  "notes": "Release notes here."
}
EOF

# 7. Upload latest.json (no-cache so backend always reads fresh)
gsutil -h "Cache-Control:no-store" cp latest.json \
  "gs://signalbridges-downloads/releases/windows/${APP}/latest.json"
```

**Do NOT delete the old installer** — keep previous versions for rollback.

---

## Backend Integration

### File to add

`docs/backend-downloads-blueprint.py` → copy to `algo-bridge-backend/downloads_blueprint.py`

### Register blueprint

In `algo-bridge-backend/app.py` (or equivalent):

```python
from downloads_blueprint import downloads_bp
app.register_blueprint(downloads_bp)
```

The blueprint expects `current_app.config['FIRESTORE_DB']` to be set, which matches the existing pattern in the backend.

### Python dependencies

Add to `requirements.txt` if not already present:
```
google-cloud-storage>=2.10.0
```

`firebase-admin` should already be present.

### CORS

The existing CORS allowlist already covers `signalbridges.com` and `app.signalbridges.com`.
No additional CORS changes are needed.

---

## Backend Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/downloads/releases` | Bearer token | Returns release metadata array (no URLs) |
| `GET` | `/api/downloads/console/windows` | Bearer token | Returns signed URL for Console installer |
| `GET` | `/api/downloads/runtime/windows` | Bearer token | Returns signed URL for Runtime/Agent installer |

### Access control rules

A user can download if ALL of the following are true:
1. Firebase ID token is valid and not expired
2. User record exists in Firestore `users` collection
3. `users/{uid}.active === true`
4. Either: `users/{uid}.role in ['admin', 'superadmin']`
5. Or: `tenants/{tenantId}.downloadsEnabled === true`

### Response — releases

```json
{
  "releases": [
    {
      "type": "console",
      "platform": "windows",
      "displayName": "Signal Bridge Console",
      "description": "...",
      "version": "1.0.0",
      "sha256": "a3f2c1...",
      "sizeBytes": 89234567,
      "releaseDate": "2026-05-16",
      "notes": "Initial evaluation release."
    }
  ]
}
```

### Response — download URL

```json
{
  "downloadUrl": "https://storage.googleapis.com/signalbridges-downloads/...?X-Goog-Signature=...",
  "version": "1.0.0",
  "sha256": "a3f2c1...",
  "sizeBytes": 89234567,
  "expiresInSeconds": 900
}
```

---

## Frontend Behavior

### Route

`/downloads` — no change to routing, same page as before.

### State machine

| State | Trigger | UI |
|---|---|---|
| Loading auth | Initial render | "Checking session…" spinner |
| Unauthenticated | No user | Sign-in card with Google button |
| Loading releases | User signed in | "Loading available releases…" spinner |
| Releases shown | Fetch success | Release cards with Download button |
| Downloading | Button clicked | Button shows spinner + "Preparing download…" |
| Download ready | Signed URL received | `window.open(url)` triggers browser download |
| Error | Any fetch failure | Red inline error message with specific text |

### Error messages shown to user

| Error code | User-visible message |
|---|---|
| `not_authenticated` | "Your session has expired. Please sign out and sign in again." |
| `not_authorized` | "Your account is not authorized to download installers. Contact your administrator." |
| `not_available` | "No installer is currently available for this platform." |
| `server_error` | "Download is temporarily unavailable. Please try again shortly." |

### Environment variables required

```bash
# Copy .env.example to .env.local and fill in values
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_API_BASE_URL=https://your-backend.run.app
```

Values come from: Firebase console → Project Settings → Your apps → Web app config.

---

## Firebase Auth Setup

In the Firebase console for project `algobridge-36446`:

1. **Authentication → Sign-in method → Google** — Enable
2. **Authentication → Settings → Authorized domains** — Confirm `signalbridges.com` and `app.signalbridges.com` are listed
3. If the website is also on `algobridge-36446.web.app`, that is already authorized

---

## Enabling Downloads for a Tenant

To allow a tenant's users to download:

```
Firestore: tenants/{tenantId}
  downloadsEnabled: true    ← add this field
```

To allow a specific user regardless of tenant:

```
Firestore: users/{uid}
  role: "admin"    ← or "superadmin"
  active: true
```

---

## Rollback Process

If a release must be pulled:

1. Delete or replace `latest.json` in GCS:
   ```bash
   gsutil rm gs://signalbridges-downloads/releases/windows/console/latest.json
   ```
   Users will see "No releases are currently available for your account."

2. To roll back to a prior version, upload the previous `latest.json` pointing to the old installer:
   ```bash
   gsutil cp latest-v1.0.0.json \
     gs://signalbridges-downloads/releases/windows/console/latest.json
   ```
   Keep prior `latest.json` versions locally with version suffixes for exactly this purpose.

3. Any signed URLs already issued will continue to work until their 15-minute expiry.

---

## Test Checklist

| Test | Expected Result | Pass/Fail |
|---|---|---|
| Open `/downloads` when not signed in | Sign-in card shown, no installer data fetched | |
| Sign in with an unauthorized Google account | 403 error: "not authorized" shown | |
| Sign in with an authorized account | Release cards shown with version, size, SHA-256 | |
| Click Download Installer | Button shows spinner → browser opens download | |
| Verify downloaded file SHA-256 matches UI | `certutil -hashfile <file> SHA256` output matches | |
| Attempt to use expired signed URL | GCS returns 403 | |
| Try to access installer object directly by path | GCS returns 403 (no public access) | |
| Disable user (`active: false`) and attempt download | 403 error: "not authorized" | |
| Remove `downloadsEnabled` from tenant and attempt | 403 error: "not authorized" | |
| Inspect backend logs after download | No signed URL present in log lines | |
| CORS preflight from `signalbridges.com` | `Access-Control-Allow-Origin` returned correctly | |
| Sign out on Downloads page | Releases cleared, sign-in card shown | |

---

## Files Changed

| File | Change |
|---|---|
| `src/firebase.js` | New — Firebase app + auth initialization |
| `src/pages/Downloads.jsx` | Full rewrite — authenticated downloads with release cards |
| `.env.example` | New — template for Firebase config + API base URL |
| `.gitignore` | Added `.env.local` |
| `docs/backend-downloads-blueprint.py` | New — complete Flask blueprint for backend |
| `package.json` | `firebase` package added |

---

## Remaining Manual Steps Before Live Use

1. **Create GCS bucket** `signalbridges-downloads` (see commands above)
2. **Set CORS policy** on bucket
3. **Grant service account** `storage.objectViewer` + `iam.serviceAccountTokenCreator`
4. **Enable Google sign-in** in Firebase console for project `algobridge-36446`
5. **Add authorized domains** in Firebase Auth settings
6. **Register blueprint** in `algo-bridge-backend/app.py`
7. **Add `google-cloud-storage`** to backend `requirements.txt`
8. **Upload first installer** + `latest.json` to GCS
9. **Set `downloadsEnabled: true`** on intended tenant(s) in Firestore
10. **Create `.env.local`** from `.env.example` and populate Firebase config values
11. **Set `VITE_API_BASE_URL`** in `.env.local` to the backend Cloud Run URL
12. **Rebuild and redeploy** the website: `npm run deploy`

---

## Risks

| Risk | Mitigation |
|---|---|
| Service account lacks signing permission | Verify `iam.serviceAccountTokenCreator` is granted on itself before first use |
| Firebase Auth popup blocked by browser | Advise evaluators to allow popups for `signalbridges.com` |
| `latest.json` stale in GCS CDN cache | Upload with `Cache-Control: no-store`; backend reads directly |
| User shares signed URL before expiry | 15-minute window limits exposure; add download event logging for audit |
| Backend deployed without blueprint registered | `/api/downloads/*` returns 404; frontend shows "server_error" |
