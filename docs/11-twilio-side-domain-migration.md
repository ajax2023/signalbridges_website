# 11-twilio-side-domain-migration.md

## Purpose
Step-by-step runbook for migrating Twilio-integrated components from legacy `canalerts` naming/domains to `signalbridges` while minimizing risk.

This document focuses on:
- Twilio Console changes (Voice, SMS, SIP)
- DNS / HTTPS requirements for Twilio webhooks
- Backend configuration points impacted by domain changes
- SIP-specific considerations
- Verification after each step
- Rollback guidance

## Scope / Non-goals
- **In scope**: Twilio webhook URLs, Twilio SIP Domain cutover plan, backend env vars supporting the new domains, SIP config values stored in Firestore.
- **Out of scope**: Renaming Firebase projects, changing backend API hosts, or refactoring Twilio logic.

## Current backend endpoints (authoritative)
Backend routes are implemented under `algo-bridge-backend/handlers/twilio_handlers.py`:

- Voice / SIP inbound (legacy):
  - `POST /api/twilio/voice-hook`
- SIP connect helper (Twilio Request URL that returns TwiML <Dial><Sip>):
  - `GET|POST /api/twilio/sip-connect`
- Voice TwiML generator:
  - `POST /api/twilio/voice-twiml`
- Voice status aggregation:
  - `POST /api/twilio/status-hook`
- SMS inbound:
  - `POST /api/twilio/sms-hook`
- SMS fallback:
  - `POST /api/twilio/sms-fallback`

SIP Router (newer path, used for SIP Domain routing):
- `POST /api/v2/voice/sip-router` (implemented in `algo-bridge-backend/handlers/sip_router_handler.py`)

## Key domain decisions you must make first
You’ll need **two different classes of “domains”**:

1) **Twilio SIP Domain** (Twilio-owned, ends in `sip.twilio.com`)
- Example (new): `signalbridges.sip.us1.twilio.com`
- This is configured in Twilio and used for SIP addressing and inbound SIP calls.

2) **Public HTTPS webhook base URL** (your domain, resolves to your backend)
- Example (new): `https://twilio.signalbridges.com`
- This must present a valid, public TLS cert (Google-managed is fine).
- Twilio will POST to this base URL + the webhook path.

Recommendation:
- Use a dedicated webhook hostname like `twilio.signalbridges.com` for operational separation.

## Step-by-step migration plan (safe sequencing)

### Step 0 — Snapshot current Twilio + backend config (no changes)
**Goal**: Record current settings so rollback is trivial.

**Prompt to use** (copy/paste into your notes):
```text
Record current Twilio configuration:
- Voice: Which Phone Numbers / SIP Domains are in use?
- Request URLs (Voice, Status Callback, SMS webhook)
- SIP Domain SID + domain name (e.g., canalerts.sip.*.twilio.com)
- Credential list SIDs / IP ACLs / auth settings
- Messaging Service SID (if any) and its inbound webhook config
Record backend:
- Cloud Run service URL
- Any current custom domains mapped to backend
- Current Cloud Run env vars: TWILIO_* and DEFAULT_FROM_EMAIL
```

**Checks**:
- Confirm you can hit backend health:
  - `HEAD https://<backend-host>/health` returns `200`
- Confirm current Twilio webhooks are working (existing calls/SMS still succeed).

---

### Step 1 — Create/verify a dedicated webhook hostname (DNS + HTTPS)
**Goal**: Ensure Twilio can reach your backend at a stable `signalbridges` hostname.

Suggested hostname:
- `twilio.signalbridges.com`

**Prompt**:
```text
Create a public HTTPS endpoint for Twilio webhooks:
- Map twilio.signalbridges.com to the backend (Cloud Run / Google-managed TLS)
- Ensure the cert is valid and hostname matches exactly
- Ensure requests preserve Host header so Twilio signature validation works
```

**Checks**:
- `curl -I https://twilio.signalbridges.com/health` returns `200`
- Confirm the response cert is valid (no browser warnings).

**Rollback**:
- If mapping fails, do not change Twilio yet. Fix DNS/domain mapping first.

---

### Step 2 — Update Twilio Voice webhook(s) to the new webhook hostname
**Goal**: Move Twilio’s HTTP callbacks from legacy hostnames to `twilio.signalbridges.com`.

**What to change in Twilio Console**:
- For **Voice (SIP Domain or Phone Number)** set the Request URL to one of:
  - Preferred (newer routing):
    - `https://twilio.signalbridges.com/api/v2/voice/sip-router`
  - Legacy compatibility:
    - `https://twilio.signalbridges.com/api/twilio/voice-hook`

**Prompt**:
```text
In Twilio Console > Voice:
- Update the Request URL for inbound calls to:
  https://twilio.signalbridges.com/api/v2/voice/sip-router
- Ensure HTTP method is POST
- If using a Status Callback, set it to:
  https://twilio.signalbridges.com/api/twilio/status-hook
```

**Checks**:
- Place a test call that triggers inbound routing.
- Backend logs should show:
  - `[SIP-ROUTER] Received call:` OR `[TWILIO][SIP-INBOUND] Received call:`
- Confirm you are NOT seeing signature failures:
  - `Invalid signature` / `Unauthorized request` indicates host/proto mismatch.

**Rollback**:
- Revert Twilio Request URL back to the previous hostname/path.

---

### Step 3 — Update Twilio SMS webhook(s) to the new webhook hostname
**Goal**: Move Twilio inbound SMS HTTP callbacks.

**Twilio endpoint(s)**:
- Primary:
  - `https://twilio.signalbridges.com/api/twilio/sms-hook`
- Fallback:
  - `https://twilio.signalbridges.com/api/twilio/sms-fallback`

**Prompt**:
```text
In Twilio Console > Messaging:
- Update inbound webhook to:
  https://twilio.signalbridges.com/api/twilio/sms-hook
- Update fallback webhook to:
  https://twilio.signalbridges.com/api/twilio/sms-fallback
- Ensure HTTP method is POST
```

**Checks**:
- Send a test SMS into the Twilio number.
- Backend logs show SMS handler activity.
- Confirm no 4xx/5xx responses in Twilio Message Logs.

**Rollback**:
- Revert Messaging webhook URLs back to the previous hostname/path.

---

### Step 4 — Create the new Twilio SIP Domain (parallel-run)
**Goal**: Establish a new Twilio SIP Domain using the `signalbridges` brand without breaking existing tenants.

Important:
- Twilio SIP Domains are not your DNS; they are Twilio-managed. You choose a unique subdomain prefix.

**Prompt**:
```text
In Twilio Console > Voice > SIP Domains:
- Create a new SIP Domain such as:
  signalbridges.sip.us1.twilio.com
- Configure the Voice Request URL to:
  https://twilio.signalbridges.com/api/v2/voice/sip-router
- Configure credentials / IP ACLs to match the old domain as needed
- Record:
  - New SIP Domain SID
  - New Domain FQDN
```

**Checks**:
- Make sure Twilio shows the new domain as active.
- Make a controlled inbound call to the new SIP domain (if you have a test client).

**Rollback**:
- Keep old SIP domain active; do not delete it.

---

### Step 5 — Update tenant SIP config (Firestore) to point to the new SIP Domain
**Goal**: Ensure routing and outbound dialing uses the new SIP domain per-tenant.

Backend reads tenant SIP config at:
- `tenants/{tenantId}/sipConfig/default`

Fields involved (observed in code):
- `domainFqdn` (e.g., `signalbridges.sip.us1.twilio.com`)
- `sipDomainSid` (Twilio SID)

**Prompt**:
```text
For a single pilot tenant:
- Update Firestore document tenants/{tenantId}/sipConfig/default:
  - domainFqdn = signalbridges.sip.us1.twilio.com
  - sipDomainSid = <new SipDomainSid>
- Do NOT update all tenants at once.
```

**Checks**:
- Inbound calls to the new SIP Domain route to the correct tenant.
- Outbound SIP calls (if used) resolve to the new `domainFqdn`.

**Rollback**:
- Set `domainFqdn` and `sipDomainSid` back to the previous values.

---

### Step 6 — Update backend environment variables (only after Twilio + DNS are proven)
**Goal**: Move default/operational “from” identities and TwiML URLs away from `canalerts`.

Backend env vars already supported:
- `DEFAULT_FROM_EMAIL` (used by SendGrid path)
- `TWILIO_SIP_FROM`
- `TWILIO_SIP_DOMAIN`
- `TWILIO_VOICE_TWIML_URL`

New backend env var added (optional safety net):
- `TWILIO_SIP_DOMAIN_FALLBACK`
  - Used only when tenant SIP config is missing.

**Prompt**:
```text
In Cloud Run env vars (or Secret Manager where appropriate), set for the new domain:
- DEFAULT_FROM_EMAIL=admin@signalbridges.com   (only if SendGrid is configured for this sender)
- TWILIO_SIP_FROM=sip:admin@signalbridges.com  (only if Twilio/SIP expects this identity)
- TWILIO_SIP_DOMAIN_FALLBACK=signalbridges.sip.us1.twilio.com
- TWILIO_VOICE_TWIML_URL=https://twilio.signalbridges.com/api/twilio/voice-twiml
Deploy backend revision after changes.
```

**Checks**:
- Outbound email still sends successfully.
- Outbound SIP calls still connect.
- No spike in `[TWILIO][SIGNATURE] Invalid signature`.

**Rollback**:
- Revert env vars to previous values.
- Redeploy previous backend revision.

## SIP-specific notes (important)
- **Inbound SIP signature validation is strict**. URL host/proto must match what Twilio used.
  - If you change webhook hostname, validate that Cloud Run forwards the correct `Host` (or `X-Forwarded-Host`).
- Tenant routing relies on `SipDomainSid` mapping.
  - When you create a new SIP Domain, you must update the tenant’s `sipDomainSid` (pilot first).

## Post-change checklist (quick)
After each step:
- Confirm existing production flows still work (calls/SMS).
- Confirm Twilio Console shows no webhook errors.
- Confirm backend logs show expected routes firing.
- Confirm no auth/signature failures.

## Rollback plan (global)
- Keep the old Twilio SIP Domain active until migration is complete.
- Revert Twilio webhook URLs first (fast rollback).
- Revert Firestore tenant SIP config for the pilot tenant.
- Revert backend env vars last.
