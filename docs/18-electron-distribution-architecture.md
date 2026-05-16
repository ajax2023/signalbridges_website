# 18 — Electron Distribution Architecture

**Date:** 2026-05-16  
**Scope:** SignalBridge Console + SignalBridge Edge Agent  
**Purpose:** Audit current hosting stack and define a simple, reliable installer distribution model for controlled early evaluation.

---

## Executive Summary

The current website stack (Firebase Hosting + React SPA) is unsuitable for hosting binary installers directly due to a **hard 10 MB per-file limit** on Firebase Hosting deployments. However, Google Cloud Storage (GCS), which is already part of the GCP/Firebase project, is the correct and natural solution. Minimal infrastructure additions are required. No new vendors or complex systems are needed.

---

## 1. Gap Analysis

### 1.1 Website / Hosting

| Area | Current State | Gap |
|---|---|---|
| Website hosting | Firebase Hosting (`algobridge-36446`) | Suitable for web only |
| Binary file hosting | Not configured | **Firebase Hosting has a 10 MB file size limit** — cannot host EXE installers |
| HTTPS/TLS | Google-managed, auto-provisioned | ✅ No gap |
| MIME type for EXE | Not configured | Needs `Content-Type: application/octet-stream` header in GCS object metadata |
| Download bandwidth | Not provisioned | GCS provides CDN-backed egress; no action needed at this scale |
| Private download page | Not implemented | Downloads page shows "Coming Soon" — suitable for now |
| Password protection | Not implemented | Not needed for Phase 1; share direct URLs out-of-band |
| Signed URLs | Not configured | GCS supports signed URLs natively — primary Phase 1 mechanism |
| CDN caching | Not configured | GCS + Firebase Hosting CDN available; not required until Phase 2+ |
| SEO indexing risk | None | Download routes are not indexed; GCS URLs are not crawlable |

### 1.2 Domain / DNS

| Area | Current State | Gap |
|---|---|---|
| `signalbridges.com` | Firebase Hosting | ✅ Operational |
| `app.signalbridges.com` | Firebase Hosting | ✅ Operational |
| `downloads.signalbridges.com` | Not configured | Needs CNAME or Firebase Hosting custom domain → GCS |
| SSL certificate | Google-managed via Firebase | ✅ Auto-provisioned on custom domain connect |

### 1.3 Security

| Area | Assessment |
|---|---|
| Code signing | Applications are already signed — ✅ no gap |
| SmartScreen reputation | New publisher — low initial reputation; will build with each verified install |
| Browser download warnings | Expected for new EXE from any source — signing reduces but does not eliminate |
| Secure delivery | GCS signed URLs provide expiring, per-evaluator links |
| Malware scanning reputation | No additional steps required; EV certificate accelerates SmartScreen trust if obtainable |

### 1.4 Electron Distribution

| Area | Current State | Gap |
|---|---|---|
| Installer format decision | Not defined | Recommend NSIS (below) |
| Auto-update infrastructure | Not implemented | Phase 2 item — `electron-updater` + GCS `latest.yml` |
| Config/identity survival across upgrades | Depends on installer design | Must be verified per agent (below) |

---

## 2. Recommended Architecture

### Core Principle

> Firebase Hosting serves the website. GCS serves the binaries. They share the same GCP project.

```
Evaluator browser
      │
      ├── https://signalbridges.com  ──────────────── Firebase Hosting (website, SPA)
      │
      └── Signed GCS URL (shared directly)
                │
                └── gs://signalbridges-downloads/  ── GCS Bucket (private, installer files)
```

For Phase 2+, a public update feed can be added:

```
Electron app (running)
      │
      └── GET https://storage.googleapis.com/signalbridges-downloads/console/latest.yml
                │
                └── GCS Bucket (latest.yml public, installer private via signed URL)
```

---

## 3. Recommended Folder / Bucket Structure

### GCS Bucket: `signalbridges-downloads`

```
signalbridges-downloads/
├── console/
│   ├── latest.yml                          ← electron-updater feed (Phase 2)
│   ├── SignalBridgeConsole-Setup-1.0.0.exe
│   └── SignalBridgeConsole-Setup-1.0.0.exe.blockmap
│
└── agent/
    ├── latest.yml                          ← electron-updater feed (Phase 2)
    ├── SignalBridgeAgent-Setup-1.0.0.exe
    └── SignalBridgeAgent-Setup-1.0.0.exe.blockmap
```

**Bucket access model:**
- Bucket: **private** (default deny)
- Installers: private — accessed via signed URLs only
- `latest.yml`: publicly readable (Phase 2 only; safe — contains only version + filename + hash)

---

## 4. Installer Format Recommendation

### Use NSIS (electron-builder default for Windows)

| Format | Recommendation | Reason |
|---|---|---|
| **NSIS** | ✅ **Recommended** | Standard Windows installer (`.exe`), supports per-machine or per-user install, configurable install path, writes to Programs list, uninstall entry, Start Menu shortcut. Works with electron-updater. |
| Squirrel | ⚠️ Optional | GitHub-native; installs per-user silently. Less control over install path. Not recommended for agent (service). |
| Portable | ⚠️ Secondary use | No install, no update. Acceptable for rapid early evaluation. Does not persist as a service. |

### Console (SignalBridge Console)
- **NSIS per-user install** — installs to `AppData\Local`, no elevation required
- Preserves user config in `AppData\Roaming\SignalBridgeConsole\` across upgrades (electron-builder default)

### Agent (SignalBridge Edge Agent)
- **NSIS per-machine install** — installs to `Program Files`, requires elevation
- Runs as Windows Service
- Persists agent identity + config in a fixed data directory (e.g., `C:\ProgramData\SignalBridgeAgent\`)
- **Critical:** agent identity (`AGENT_ID`, credentials, config) must be stored in `ProgramData`, NOT in the install directory, so reinstall/upgrade never overwrites it

---

## 5. Config and Identity Survival Across Upgrades

### Console
- `electron-builder` NSIS upgrades replace app files, preserve `AppData\Roaming` data
- No action needed if config is stored in `app.getPath('userData')`

### Agent
- Agent identity must survive installer replacement
- **Required:** store all persistent state (agent ID, certificates, config) in `C:\ProgramData\SignalBridgeAgent\` — not inside the install directory
- NSIS installer must NOT touch `ProgramData` on upgrade (default behavior — confirm in `nsis` config)
- **Test:** install v1.0 → register agent → install v1.1 over top → verify agent ID and credentials intact

### Rollback
- Phase 1: manual rollback by re-running the previous installer (share both versions via GCS)
- Phase 2: `electron-updater` supports rollback via `allowDowngrade` option

---

## 6. SmartScreen and Browser Trust

### What to expect
- New EXE from a new publisher will trigger SmartScreen "Unknown Publisher" warning on first download
- This is expected regardless of code signing until reputation is established
- **Extended Validation (EV) certificate** removes SmartScreen warnings immediately — highly recommended for agent distribution where elevation is required

### Mitigation steps
1. Use OV or EV code signing certificate (EV preferred for agent)
2. Share download links directly with evaluators — not via public page — reduces volume of anonymous downloads that could suppress reputation
3. Include SHA-256 hash alongside each shared link so evaluators can verify integrity independently
4. Document expected SmartScreen behavior in evaluator onboarding notes

---

## 7. Auto-Update Architecture (Phase 2 Readiness)

### Minimal implementation using `electron-updater`

`electron-updater` (part of `electron-builder`) is the standard, well-maintained solution. It requires:

1. A `latest.yml` file at a known HTTPS URL
2. The installer `.exe` at a known HTTPS URL (or signed URL)
3. One code addition to the Electron main process

**`latest.yml` example (generated by electron-builder automatically):**
```yaml
version: 1.1.0
files:
  - url: SignalBridgeConsole-Setup-1.1.0.exe
    sha512: <hash>
    size: 89234567
path: SignalBridgeConsole-Setup-1.1.0.exe
sha512: <hash>
releaseDate: '2026-05-16T00:00:00.000Z'
```

**Electron main process (minimal):**
```js
const { autoUpdater } = require('electron-updater');
autoUpdater.setFeedURL('https://storage.googleapis.com/signalbridges-downloads/console/');
autoUpdater.checkForUpdatesAndNotify(); // prompts user, does not auto-install
```

**GCS configuration for Phase 2:**
- `latest.yml` — public read
- `.exe` installer — public read (or signed URL embedded in `latest.yml`)
- `Content-Type: application/octet-stream` on installer objects
- `Content-Type: application/x-yaml` on `latest.yml`

### Does Firebase Hosting or GCS support this?

| Capability | Firebase Hosting | GCS |
|---|---|---|
| Host `latest.yml` | ✅ (if small) | ✅ |
| Host installer `.exe` | ❌ (10 MB limit) | ✅ |
| HTTPS | ✅ | ✅ |
| CORS (for electron-updater) | ✅ configurable | ✅ configurable |
| Signed URLs | ❌ | ✅ |

**Decision: Use GCS for all binary distribution. Firebase Hosting serves only the website.**

---

## 8. Domain and DNS

### Recommended Setup

| Subdomain | Purpose | Target |
|---|---|---|
| `signalbridges.com` | Marketing website | Firebase Hosting (existing) |
| `app.signalbridges.com` | React console app | Firebase Hosting (existing) |
| `downloads.signalbridges.com` | Download landing / CDN | Firebase Hosting custom domain → rewrites to GCS (Phase 2), or omit in Phase 1 |

### Phase 1
`downloads.signalbridges.com` is **not required**. Share raw signed GCS URLs with evaluators directly. No DNS change needed.

### Phase 2
Add `downloads.signalbridges.com` as a Firebase Hosting custom domain. Configure Firebase Hosting `rewrites` to redirect to GCS URLs, or use it purely as a landing page that links to GCS.

**SSL:** Google automatically provisions and renews TLS certificates for custom domains added to Firebase Hosting. No manual certificate management needed.

---

## 9. Operational Workflow

### Version Naming Convention
```
SignalBridgeConsole-Setup-{major}.{minor}.{patch}.exe
SignalBridgeAgent-Setup-{major}.{minor}.{patch}.exe

Example:
SignalBridgeConsole-Setup-1.0.0.exe
SignalBridgeAgent-Setup-1.2.1.exe
```

Semantic versioning. Increment `patch` for hotfixes, `minor` for feature updates, `major` for breaking changes.

### Phase 1 Operational Workflow (Manual)

```
1. BUILD
   electron-builder --win nsis
   Output: dist/SignalBridgeConsole-Setup-1.0.0.exe

2. SIGN (already in build pipeline)
   signtool sign /fd sha256 /tr ... /td sha256 <installer.exe>
   Verify: signtool verify /pa <installer.exe>

3. HASH (for evaluator verification)
   certutil -hashfile SignalBridgeConsole-Setup-1.0.0.exe SHA256
   Record hash in evaluator notes

4. UPLOAD TO GCS
   gsutil cp SignalBridgeConsole-Setup-1.0.0.exe gs://signalbridges-downloads/console/
   gsutil setmeta -h "Content-Type:application/octet-stream" \
     gs://signalbridges-downloads/console/SignalBridgeConsole-Setup-1.0.0.exe

5. GENERATE SIGNED URL (7-day expiry for evaluation)
   gsutil signurl -d 7d -m GET service-account-key.json \
     gs://signalbridges-downloads/console/SignalBridgeConsole-Setup-1.0.0.exe

6. DISTRIBUTE
   Share signed URL + SHA-256 hash with evaluator directly (email or secure message)
   Document: evaluator name, version, date shared, URL expiry

7. REPLACE / NEW VERSION
   Upload new version with new filename (keep old version)
   Generate new signed URL
   Notify evaluators
```

### Phase 2 Addition (Check for Updates)

```
8. UPDATE FEED
   electron-builder generates latest.yml automatically alongside installer
   gsutil cp latest.yml gs://signalbridges-downloads/console/
   gsutil acl ch -u AllUsers:R gs://signalbridges-downloads/console/latest.yml

   App checks on launch → notifies user → user initiates download
```

### Phase 3 Addition (Optional Auto-Update)

```
9. SILENT UPDATE (opt-in)
   Change: autoUpdater.checkForUpdatesAndNotify()
       → autoUpdater.autoDownload = true
          autoUpdater.checkForUpdates()
   Present update-ready dialog before installing
   Keep user in control of timing
```

---

## 10. Phased Rollout Plan

### Phase 1 — Manual Installer Distribution (Now)

**Goal:** Get installers to a small number of known evaluators securely.

| Item | Action |
|---|---|
| GCS bucket | Create `signalbridges-downloads` in Firebase project `algobridge-36446` |
| Bucket access | Set to private (default deny) |
| Upload workflow | Manual via `gsutil` or GCS console |
| Download mechanism | Signed URL per evaluator, 7-day expiry |
| Website | Downloads page stays as-is ("Coming Soon") — links shared out-of-band |
| DNS | No changes required |

**Estimated setup time:** 1–2 hours.

---

### Phase 2 — Check for Updates (Next)

**Goal:** Running app can detect a newer version and prompt the user to download.

| Item | Action |
|---|---|
| electron-updater | Add to Console and Agent Electron apps |
| `latest.yml` | Published to GCS alongside each new installer |
| Feed URL | `https://storage.googleapis.com/signalbridges-downloads/console/` |
| `latest.yml` access | Public read |
| Installer access | Keep private; embed signed URL in `latest.yml` OR make installer public |
| DNS | Optional: add `downloads.signalbridges.com` |

**Estimated setup time:** 2–4 hours per app.

---

### Phase 3 — Optional Silent Auto-Update

**Goal:** App downloads and stages update in background; user confirms install on restart.

| Item | Action |
|---|---|
| `autoDownload` flag | Set `autoUpdater.autoDownload = true` |
| Update dialog | Implement `update-downloaded` event handler → prompt restart |
| Delta updates | electron-builder `.blockmap` files already generated; electron-updater uses them automatically |
| Rollback | Retain previous installer in GCS; document manual rollback process |

---

## 11. What Is Currently Missing

| Item | Required For | Priority |
|---|---|---|
| GCS bucket (`signalbridges-downloads`) | Phase 1 distribution | **High — blocks distribution** |
| GCS IAM / service account for `gsutil signurl` | Phase 1 signed URLs | High |
| `electron-updater` integration in Console app | Phase 2 | Medium |
| `electron-updater` integration in Agent app | Phase 2 | Medium |
| Agent config stored in `ProgramData` (not install dir) | All phases | **High — upgrade safety** |
| EV code signing certificate (optional but recommended) | SmartScreen trust | Medium |
| `latest.yml` publication in build pipeline | Phase 2 | Medium |
| `downloads.signalbridges.com` DNS + Firebase custom domain | Phase 2 polish | Low |
| Evaluator distribution log (name, version, URL, expiry) | Operational hygiene | Low |

---

## 12. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| SmartScreen "Unknown publisher" warning deters evaluators | High | Medium | Set evaluator expectations; provide hash for manual verification; pursue EV cert |
| Agent config wiped on installer upgrade | Low | High | Store all state in `ProgramData`; verify before Phase 1 release |
| Signed URL shared or forwarded unintentionally | Low | Low | Short expiry (7 days); bucket is private; file can be deleted if needed |
| GCS egress cost at scale | Low | Low | Negligible at evaluation volume; monitor if distribution broadens |
| `latest.yml` served stale by GCS CDN | Low | Low | Set `Cache-Control: no-cache` on `latest.yml` object |

---

## 13. Implementation Checklist

### Immediate (Phase 1)
- [ ] Create GCS bucket `signalbridges-downloads` in project `algobridge-36446`
- [ ] Set bucket to private (uniform bucket-level access)
- [ ] Create or identify a service account with `roles/storage.objectAdmin` for upload/sign
- [ ] Define folder structure: `console/` and `agent/`
- [ ] Upload first installer builds
- [ ] Set `Content-Type: application/octet-stream` on EXE objects
- [ ] Generate SHA-256 hash for each installer
- [ ] Test signed URL generation and download on a clean Windows machine
- [ ] Verify SmartScreen behavior on clean machine
- [ ] Verify agent config survives reinstall (upgrade test)
- [ ] Document evaluator distribution log

### Phase 2
- [ ] Add `electron-updater` to Console electron-builder config
- [ ] Add `electron-updater` to Agent electron-builder config
- [ ] Confirm `latest.yml` is generated on build
- [ ] Upload `latest.yml` to GCS with `Cache-Control: no-cache`
- [ ] Set `latest.yml` ACL to public read
- [ ] Test update detection on installed app
- [ ] Optionally add `downloads.signalbridges.com` custom domain
