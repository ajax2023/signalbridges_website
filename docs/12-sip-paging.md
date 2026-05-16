# SIP Paging / SIP Calling (Authoritative)

## 1) Overview

This system supports **SIP calling** and a feature labeled **SIP paging**.

SIP paging is invoked from the **user home screen / launcher** alongside RTP paging. The launcher presents both as paging options, but they have different execution paths and availability guarantees (see `docs/00-overview.md` and `docs/03-data-flows.md`).

In this codebase, **SIP paging** means:

- An operator uses the web UI to start a **live microphone session**.
- The browser uses **Twilio Voice (WebRTC)** to place a call.
- Twilio bridges that call to a configured **SIP URI** (a “SIP paging zone”).

This is **not RTP multicast paging** and does **not** involve the on-prem agent’s RTP paging pipeline.

Key distinction:

- **RTP paging** = browser audio → agent (direct WS or audio-relay) → agent sends **RTP multicast** on the LAN.
- **SIP paging** = browser audio → **Twilio** → **SIP endpoint** (no LAN agent, no multicast from this platform).

## 2) Supported SIP Use Cases (What Works Today)

### 2.1 Supported: Inbound SIP calling via Twilio SIP Domain (SIP Router)

- Twilio SIP Domain receives an inbound SIP call.
- Twilio invokes backend webhook:
  - `POST /api/v2/voice/sip-router` (preferred)
- Backend returns TwiML to route the call as either:
  - SIP → SIP (`<Dial><Sip>...`) or
  - SIP → PSTN (`<Dial>+E164`) depending on tenant SIP config.

### 2.2 Supported: Operator-initiated “SIP paging” (browser microphone → SIP endpoint)

- Operator uses the UI “Live Paging (SIP)” dialog.
- UI calls backend to authorize paging for a specific SIP paging zone.
- UI uses Twilio Voice SDK to establish a live audio session.
- Twilio bridges the browser’s audio to the zone’s configured `sipUri`.

Important constraint:

- The operator-started SIP paging path does **not** accept an arbitrary SIP URI from the browser.
- The browser requests authorization for a **pre-configured** SIP paging zone ID, and the backend selects the zone’s `sipUri`.

### 2.3 Supported: Backend-triggered outbound SIP calling (Twilio REST)

The backend contains utilities (`services/twilioClient.make_sip_call`, `utils/sip_utils.call_sip`) that can place outbound SIP calls via Twilio.

This is a **call placement capability** (e.g., play TTS and hang up). It is **not** the same as “SIP paging” (live mic) unless a specific product workflow uses it that way.

### 2.4 Common assumptions that are **NOT** supported (or not proven)

- **Offline SIP paging**: not supported.
- **SIP paging via the agent**: not part of the implemented SIP paging path.
- **RTP multicast initiated by SIP paging**: not part of this platform’s SIP paging media path.
- **Emergency-grade operation without Twilio**: not supported.
- **Guaranteed zone-duration enforcement**: SIP paging zones store default/max duration fields, but enforcement is not proven by the audited call-start path.

### 2.5 Supported (but not “SIP paging”): Direct TwiML connect to a SIP URI

The backend endpoint `GET|POST /api/twilio/sip-connect` supports a mode where Twilio can request TwiML for a direct SIP dial target:

- If `authToken` / `t` is not provided, but `targetSip` is provided, the backend returns TwiML that dials `targetSip`.

This behavior:

- Requires valid `X-Twilio-Signature` verification (when enabled).
- Bypasses the SIP paging zone authorization flow.
- Should be treated as a **separate Twilio integration capability**, not the operator “SIP paging zone” feature.

## 3) Architecture

### 3.1 Control-plane ownership

- **Operator UI (Canalerts)**
  - Initiates SIP paging.
  - Holds the “start/stop” state in the browser.

- **Backend (algo-bridge-backend)**
  - AuthN/AuthZ for operators (Firebase).
  - Authorizes SIP paging for a zone and mints a short-lived auth token.
  - Returns Twilio access tokens for Twilio Voice SDK.
  - Generates TwiML to connect the call to the target SIP URI.

- **Twilio**
  - Owns the call lifecycle, media negotiation, and bridging.
  - Calls backend webhooks for TwiML.

- **Agent (algo-network-agent)**
  - **No role in SIP paging media-plane** in the current implementation.
  - Agent RTP paging remains a separate feature.

### 3.2 SIP paging control-plane sequence (audited)

Authoritative code references:

- UI: `Canalerts/src/pages/HomeLauncher/components/SipPagingDialog.jsx`
- Backend: `algo-bridge-backend/handlers/paging_admin.py`
- Backend: `algo-bridge-backend/handlers/twilio_handlers.py`

Flow:

1. **UI authorizes SIP paging for a zone**
   - `POST /api/v2/tenants/{tenantId}/sip-paging/authorize`
   - Backend checks:
     - `sipPagingEnabled` (tenant setting)
     - zone exists, is active
     - zone allowlists (roles and/or user IDs)
     - `sipUri` is present
     - `sipUri` domain matches tenant SIP domain (prevents cross-tenant/domain paging)
   - Backend returns `authToken` with a short TTL.

2. **UI obtains Twilio Voice access token**
   - `POST /api/twilio/voice-token`
   - Backend returns a Twilio Voice JWT used by the browser Twilio Voice SDK.

3. **UI starts the call (Twilio Voice SDK)**
   - UI calls `device.connect({ params: { t: authToken } })`
   - Twilio invokes backend TwiML endpoint to decide where to dial.

4. **Backend returns TwiML to connect the call to the zone’s SIP URI**
   - `GET|POST /api/twilio/sip-connect?t=<authToken>`
   - Backend validates Twilio signature and consumes the token (one-time use), then returns TwiML:
     - `<Dial><Sip>{targetSipUri}</Sip></Dial>`

Note:

- `sip-connect` also supports a direct `targetSip` parameter (see Section 2.5), but that is not the operator SIP paging path.

5. **Stop**
   - UI disconnects the Twilio call (`disconnect()` / `disconnectAll()`); Twilio tears down media.

### 3.3 SIP calling (inbound SIP router) control-plane sequence (audited)

Authoritative code reference: `algo-bridge-backend/handlers/sip_router_handler.py`

- Twilio posts inbound SIP call events to:
  - `POST /api/v2/voice/sip-router`
- Backend validates `X-Twilio-Signature` (unless disabled).
- Backend maps `SipDomainSid` to tenant by scanning `tenants/{tenantId}/sipConfig/default.sipDomainSid`.
- Backend normalizes dial target and returns TwiML for:
  - SIP → SIP or SIP → PSTN.

### 3.4 Media-plane

#### SIP paging media-plane

- Browser microphone audio flows via **Twilio Voice (WebRTC)**.
- Twilio bridges media to the configured SIP endpoint (`sipUri`).
- The backend is **not** in the audio path.

#### SIP calling media-plane

- Media flows between **Twilio** and the SIP endpoint(s)/PSTN.
- The backend provides TwiML decisions, but is **not** an RTP bridge.

### 3.5 ASCII diagram

```
            (Control-plane)                              (Media-plane)

   [Operator Browser]
        |   POST /api/v2/tenants/{tid}/sip-paging/authorize (Firebase auth)
        |---------------------------------------------------->
        |                         [algo-bridge-backend]
        |<----------------------------------------------------
        |                     { authToken (short-lived) }
        |
        |   POST /api/twilio/voice-token (Firebase auth)
        |---------------------------------------------------->
        |<----------------------------------------------------
        |                   { Twilio Voice JWT }
        |
        |  Twilio Voice SDK connect(params: {t: authToken})
        |========================== WebRTC ===============================>
        |                           [Twilio]
        |                               |
        |                               |  TwiML fetch (signed)
        |                               |  GET/POST /api/twilio/sip-connect?t=...
        |                               |------------------------------->
        |                               |      [algo-bridge-backend]
        |                               |<-------------------------------
        |                               |   <Dial><Sip>sip:zone@...</Sip>
        |                               |
        |                               |=========== SIP/RTP/SRTP (Twilio-managed) ========>
        |                               |                     [SIP Endpoint]
        |
   Stop = browser disconnects Twilio call; Twilio ends bridging.
```

## 4) Operational Characteristics

### 4.1 Cloud dependencies

SIP paging requires:

- **Canalerts frontend** (operator UI)
- **algo-bridge-backend** (Cloud Run)
  - required to authorize the zone and provide Twilio tokens/TwiML
- **Twilio**
  - required to establish and bridge the call
- **Public Internet connectivity from the browser**

The **agent is not a dependency** for SIP paging (unlike RTP paging).

### 4.2 Latency sensitivity

- SIP paging startup latency includes:
  - UI → backend authorization
  - UI → backend voice token
  - WebRTC call setup with Twilio
  - Twilio → backend TwiML fetch
  - Twilio → SIP endpoint dialing

Expect startup latency to be **higher and more variable** than LAN RTP paging.

### 4.3 Scaling behavior

- Backend SIP paging endpoints are standard HTTP requests and should scale like other backend APIs.
- Twilio is the primary scaling boundary for concurrent calls.
- The backend uses a short-lived, one-time token stored in Firestore (`sipAuthTokens`) for authorization; this adds a Firestore write per paging start.

### 4.4 Failure modes (explicit)

#### If the backend is down
- **Cannot start new SIP paging sessions**:
  - zone authorization fails
  - Twilio voice token cannot be issued
  - TwiML endpoints cannot be called
- **Existing calls may continue** if already established (Twilio↔browser↔SIP endpoint media does not require backend), but:
  - do not assume this is guaranteed for all Twilio configurations
  - logging/telemetry may be degraded

#### If Twilio is unreachable or degraded
- SIP paging cannot start.
- SIP calling (inbound routing) cannot be processed.

#### If the SIP endpoint is unreachable or misconfigured
- Twilio call setup may fail or ring/timeout.
- Operator will see a Twilio Device/call error in the UI.

#### If the tenant SIP domain configuration is missing/mismatched
- SIP paging authorization will fail with:
  - `sip_domain_not_configured` or `cross_tenant_not_allowed`

#### If Twilio signature validation fails
- TwiML endpoints will reject requests.
- Common cause: reverse proxy/Cloud Run hostname/proto mismatch vs what Twilio signed.

#### If the Twilio Voice Application / webhook configuration is wrong
- SIP paging depends on Twilio being configured to fetch TwiML from the backend (commonly `/api/twilio/sip-connect`).
- If the Twilio Voice Application SID or Voice URL points elsewhere, the browser may connect to Twilio but the call will not reach the intended SIP endpoint.

#### If `SIP_AUTH_SECRET` is not configured
- SIP paging cannot be authorized (`sip_auth_secret_not_configured`).

## 5) Operational Hardening and Failure Modes

This section describes **Phase S1** hardening requirements for operating SIP paging predictably in production.

### 5.1 Failure-mode matrix (SIP paging)

The table below enumerates realistic SIP paging failure modes and defines:

- what the operator should see
- what must be logged
- whether retry is allowed

| Failure mode | Likely cause | Operator should see (required) | Logged / audited (required minimum) | Retry policy |
|---|---|---|---|---|
| Backend unreachable | Browser cannot reach backend; Cloud Run down; auth failure | “SIP paging unavailable (cloud). Try RTP paging.” | Backend: no log (because unreachable). Frontend: capture browser error and display. | Allow retry after connectivity restored |
| Authorization denied | `sipPagingEnabled` false; zone inactive; role/user not allowed; wrong tenant | Clear, specific reason (already partly implemented in UI) | Firestore: `sipAuthorizationLogs` with decision=denied + reason; include `tenantId`, `userId`, `zoneId` | Retry only after config/permissions fixed |
| Invalid zone ID | Operator chose wrong zone | “Zone not found” | Backend: log and return `zone_not_found` | Retry with corrected zone |
| Zone misconfigured (missing SIP URI) | Zone saved without `sipUri` | “Zone not configured (missing SIP URI)” | Backend: log and return `sip_uri_missing` | Retry after admin fixes zone |
| Tenant SIP domain not configured | `tenants/{tenantId}/sipConfig/default.domainFqdn` missing | “Tenant SIP domain not configured” | Backend: return `sip_domain_not_configured` | Retry after admin fixes tenant SIP config |
| Cross-tenant / mismatched SIP domain | Zone `sipUri` domain does not match tenant domain | “SIP paging zone domain mismatch” | Backend: return `cross_tenant_not_allowed` with details | Retry after admin fixes SIP URI/domain |
| Missing `SIP_AUTH_SECRET` | Backend not configured to mint/validate SIP auth tokens | “SIP paging temporarily unavailable (server misconfigured)” | Backend: error `sip_auth_secret_not_configured` | Retry after backend config fixed |
| Twilio signature validation fails | Host/proto mismatch behind proxy; wrong webhook URL; missing `TWILIO_AUTH_TOKEN`; `VERIFY_TWILIO_SIGNATURE` enabled | “SIP paging unavailable (voice service integration error)” | Backend: `[TWILIO][SIGNATURE]` warning with method/url + reason | Retry only after Twilio config / proxy headers fixed |
| Auth token expired / not usable | Token TTL exceeded; token already used; token missing in Twilio request | “SIP paging failed to start (authorization expired). Try again.” | Backend: sip-connect reject reason (e.g., `authToken_expired`, `authToken_not_usable`) | Allow retry (new authorize) |
| Twilio Voice token issuance fails | Missing `TWILIO_*` env; backend error | “SIP paging unavailable (voice not configured)” | Backend: `[TWILIO][VOICE-TOKEN] Missing configuration` | Retry after backend config fixed |
| Twilio unreachable / operator offline | Operator has no Internet; Twilio incident; blocked WebRTC | “SIP paging unavailable (Twilio or network). Try RTP paging.” | Frontend: show call/device error; Backend may have no log | Allow retry after network restored |
| SIP endpoint unreachable / timeout | Device offline; wrong SIP URI; SIP provider unreachable | “Zone did not answer / unreachable” | Twilio: error code/status; Backend: must record final status via status callback | Allow retry; recommend backoff |
| SIP endpoint busy / rejected | Endpoint returns 486 Busy Here or rejects call | “Zone busy or rejected the call” | Twilio: final status + error code; Backend: must record final status via status callback | Allow retry with backoff |
| Abuse / overload (operator hammering start) | User repeatedly starts calls; automation; compromised account | “Too many SIP paging attempts. Wait and try again.” | Backend: rate-limit log + audit record | Blocked until window resets |

### 5.2 Rate limiting and abuse control (Phase S1 requirements)

#### Rate Limiting and Twilio Webhooks

SIP paging depends on Twilio calling backend endpoints to fetch TwiML and deliver status callbacks.

Operational requirement:

- Twilio webhook endpoints used by SIP paging must **not** be subject to generic IP-based rate limiting.
  - Twilio egress IPs are shared and can trip IP-based limiters.
  - When this happens, Twilio may record `11200` errors and SIP paging will fail.

Current guardrail:

- Twilio webhook endpoints (`/api/twilio/sip-connect`, `/api/twilio/status-hook`, and `/api/v2/voice/sip-router` if used) are exempted from the global limiter **only when** the request carries a valid `X-Twilio-Signature`.
- If signature validation fails, the request is not exempt.

Manual verification steps:

- Trigger a SIP paging call from the UI.
- In backend logs, confirm the presence of:
  - `[RATE-LIMIT][TWILIO-EXEMPT] Exempted Twilio webhook from rate limiting` for the relevant webhook paths.
- In Twilio Console Debugger, confirm there are no `11200` errors for the call.
- Confirm Twilio webhook requests to `/api/twilio/sip-connect` do not receive HTTP 429.

SIP paging also has:

- a one-time token (`sipAuthTokens`) that prevents reusing an authorization token

Phase S1 requires explicit throttles that return clear errors (no silent failure). Suggested baseline limits:

- **Per-user**: 3 SIP paging starts per 60 seconds
- **Per-tenant**: 10 SIP paging starts per 60 seconds
- **Per-zone (zoneId)**: 3 SIP paging starts per 60 seconds
- **Concurrent call cap**: 1 active SIP paging call per user; 3 active calls per tenant

Operator-facing behavior:

- Return a distinct error (e.g., `sip_rate_limited`) and show “Too many attempts. Wait 60 seconds.”
- Do not automatically retry in a tight loop.

### 5.3 Save-time configuration validation (Phase S1 requirements)

The admin UI validates SIP URI formatting, but Phase S1 requires **server-side** validation as well.

At save time (create/update SIP paging zone), validate:

- SIP URI syntax: must start with `sip:` and contain an `@<domain>`
- Domain allowlist: SIP URI hostname must equal tenant SIP domain (`tenants/{tenantId}/sipConfig/default.domainFqdn`)

Failure behavior:

- Reject save with a clear error; do not allow a “time bomb” config that only fails during an incident.

#### SIP URI Normalization Rules

For SIP paging domain validation:

- `sip:` scheme is required.
- The hostname is extracted from the SIP URI portion after `@`.
- Any `:port` suffix is ignored for hostname comparison (e.g., `sip:zone@tenant.sip.twilio.com:5061` matches `tenant.sip.twilio.com`).
- Any `;` parameters or `?` query fragments are ignored when extracting the hostname.

This normalization applies only to validation and authorization logic; it does not change stored `sipUri` values.

### 5.4 Runtime clarity (operator messaging requirements)

SIP paging is cloud-dependent. Phase S1 requires that the operator always gets an explicit state:

- If SIP paging is unavailable (Twilio down, Internet down, backend down):
  - “SIP paging unavailable. Use RTP paging.”
- If RTP paging is available as an alternative:
  - “RTP paging is LAN-based and works without Twilio.”

This is message/state definition only; UI redesign is out of scope.

## 6) Security and Abuse Controls

### 6.1 Twilio webhook signature validation (required)

SIP paging depends on Twilio calling backend endpoints. Phase S1 requires signature validation to be **enforced** for all Twilio-facing endpoints involved in SIP paging and SIP calling:

- `/api/twilio/sip-connect` (currently validated)
- `/api/twilio/status-hook` (currently validated)
- `/api/v2/voice/sip-router` (validated when `VERIFY_TWILIO_SIGNATURE=true`)

Hard requirement:

- In production, `VERIFY_TWILIO_SIGNATURE` must be **true**, and `TWILIO_AUTH_TOKEN` must be configured.

### 6.2 Signature validation bypass risks (what to harden)

The most common real-world failure/bypass mode is not cryptography; it is URL mismatch:

- If Twilio signs `https://<host>/api/twilio/sip-connect` but the backend reconstructs the URL as `http://` or with a different host, validation will fail.

Phase S1 hardening requires:

- Ensure Cloud Run / reverse proxy passes correct `X-Forwarded-Proto` and `X-Forwarded-Host`.
- Ensure Twilio is configured to call the exact host/proto the backend expects.

### 6.3 Direct `targetSip` dialing in `sip-connect`

`/api/twilio/sip-connect` supports a direct `targetSip` mode (no `authToken`). Even though it is signature-gated, it is still an **operational risk** if misconfigured.

Phase S1 requires one of:

- disable direct `targetSip` mode in production, or
- restrict it to an explicit allowlist (domain + Voice App SID) and log every use.

### 6.4 Operator identity in Twilio calls (auditability)

The frontend currently requests a Twilio voice token using a static identity (`canalerts-sip-pager`). Phase S1 requires that the identity be attributable to a real operator (e.g., `userId` or email-hash) to support incident response.

## 7) Observability and Audit

### 7.1 Minimum audit record for a SIP paging attempt

For each SIP paging attempt, Phase S1 requires capturing:

- `tenantId`
- `userId` (and `userEmail` when available)
- `zoneId`
- SIP target identifier (`targetSipUri` or a stable zone reference)
- Twilio `CallSid`
- Result state: `authorized`, `started`, `answered`, `failed`, `rejected`, `timeout`, `canceled`
- Timestamps: `authorizedAt`, `callStartedAt`, `callEndedAt`
- Error metadata: Twilio `ErrorCode`, SIP response / failure category if available

### 7.2 Where this data must live

Minimum required storage locations:

- **Backend logs** (structured, with correlation IDs)
- **Firestore**:
  - `sipAuthorizationLogs` for allow/deny decisions (already exists)
  - a durable per-call record keyed by `CallSid` for final outcomes (Phase S1 requirement)

### 7.3 Current gaps (to close in Phase S1)

- `sipAuthorizationLogs` records allow/deny but does not capture final call outcome.
- `sipAuthTokens` stores `twilioCallSid` when consumed, but there is no guaranteed linkage from Twilio status events back to `tenantId`/`zoneId`.
- `status-hook` currently attempts to infer tenant by From/To numbers, which is not reliable for SIP paging (SIP URIs and client identities).

Phase S1 requires explicit correlation between:

- the token/zone authorization record
- the Twilio `CallSid`
- the Twilio call status callback stream

## 8) Comparison: SIP Paging vs RTP Paging

| Feature | SIP Paging (Twilio) | RTP Paging (Agent multicast) |
|---|---|---|
| **Initiation** | UI authorizes a SIP zone, then starts a Twilio Voice call | UI calls backend `/api/paging/session/start`, backend signals agent via MQTT control-plane |
| **Media path** | Browser → Twilio (WebRTC) → SIP endpoint | Browser → agent (direct WS) OR Browser → audio-relay → agent; agent → RTP multicast on LAN |
| **Uses RTP multicast** | No (not from this platform). Any multicast would be inside the SIP endpoint’s own behavior | Yes (agent transmits RTP to multicast groups) |
| **Agent involvement** | None in current SIP paging path | Required (agent is the RTP sender) |
| **Offline capability** | **No** (requires backend + Twilio + Internet) | Yes (separately documented offline RTP paging mode) |
| **Primary dependencies** | Backend + Twilio + Internet + SIP endpoint reachable | Agent + LAN multicast + (optional cloud for online mode) |
| **Operational failure mode** | Fails if Twilio/backends unreachable; behaves like telephony | Fails if agent unreachable or LAN multicast misconfigured; online session start depends on MQTT broker availability |

## 9) Explicit Non-Goals

- SIP paging is **not** an offline paging mode.
- SIP paging is **not** a replacement for RTP multicast paging.
- SIP paging does **not** provide LAN device discovery/control.
- SIP paging does **not** use the Paging Bridge, audio-relay, or agent RTP server.
- SIP paging does **not** imply emergency-grade operation during Internet/Twilio outages.

## 10) Open Questions / Future Work (optional)

These are intentionally marked optional; they are not claims of current behavior.

- Confirm the exact Twilio Voice Application configuration used for SIP paging (which Voice URL/TwiML App SID is active, and whether it always routes through `/api/twilio/sip-connect`).
- Confirm which SIP endpoints are officially supported as “paging receivers” (device models, auto-answer behavior, SRTP/TLS requirements).
- Confirm whether SIP paging duration limits are enforced anywhere beyond operator UI behavior and Twilio defaults.
