# Open Questions / Technical Debt

This is a living list of unresolved questions. Items should be updated when confirmed by code or production behavior.

## Provisioning / activation

- What is the intended UX for agent activation in Electron UI mode?
  - Backend has `/api/v2/agents/activate` and `/api/v2/agents/auto-activate`.
  - The install-token headless flow is implemented.
  - **UNKNOWN**: how users obtain and enter activation codes.

## Paging

- ~~Is Paging Bridge (Cloud Run) configured with **max instances = 1** everywhere?~~
  - ~~Current implementation stores connection maps in-memory per instance.~~
  - ~~Multiple instances can split agent and backend connections.~~
  - **RESOLVED (Phase 2)**: Paging control-plane now uses MQTT. No single-instance constraint for paging. Paging Bridge is deprecated for paging.

- What is the operational rule for selecting the paging media-plane in production?
  - **CONFIRMED**: Both media-plane modes exist:
    - Direct browser→agent `/ws/live-audio`
    - Browser→`audio-relay`→agent (`/ws/audio`)
  - **UNKNOWN**: which is the preferred/default mode in production and how the UI/backend decides.

- ~~What is the audio frame format sent by the browser?~~
  - **RESOLVED**: PCM16, 8kHz, mono (signed 16-bit little-endian, downsampled from browser's native sample rate).

## Online Paging (Phase 2 - New Open Questions)

- Should `stop_paging_session` require an acknowledgment for stronger UX?
  - Current implementation is fire-and-forget; backend returns 200 immediately.
  - For stronger confirmation, agent could reply with `paging_session_stopped`.

- Should session metadata be persisted beyond memory for audits?
  - Current implementation stores session metadata in backend memory during the session.
  - For compliance, session start/stop events could be persisted to Firestore.

- What is the appropriate timeout for paging session start?
  - Current implementation uses 15 seconds.
  - May need tuning based on production latency observations.

## Offline Paging (Phase 1 - Resolved)

The following questions from the original "degraded operation" section are now resolved:

- ~~Which operator tools or local UI paths invoke local endpoints during an Internet outage?~~
  - **RESOLVED**: Agent serves a local web UI at `/offline-paging` that allows operators to page using cached zone configurations.

- ~~What must be cached locally for offline mode?~~
  - **RESOLVED**: Paging zones with `id`, `name`, `active`, `multicastGroups` (each with `group`, `port`, optional `ttl`). Cached in `offline-paging-cache.json`.

- ~~How does offline paging audit sync work?~~
  - **RESOLVED**: Offline paging audit sync to Firestore is implemented but feature-flagged (default off via `OFFLINE_AUDIT_SYNC_ENABLED=false`).

## Offline Paging (Remaining Open Questions)

- Should offline paging support authentication (e.g., a local PIN or password)?
  - Current implementation uses LAN-only trust model with no authentication.
  - For high-security environments, this may need enhancement.

- Should offline paging audit logs be centrally collected in production via built-in sync?
  - **CONFIRMED**: Offline paging audit sync to Firestore is implemented but feature-flagged (default off via `OFFLINE_AUDIT_SYNC_ENABLED=false`).
  - **OPEN**: What is the mandated production policy (leave off by default vs enable for all enterprise tenants)?
  - **OPEN**: What operator/support workflow is used to verify sync health (logs only vs UI surfacing)?

- Should offline paging cache sync be triggered manually (e.g., via UI button) in addition to automatic periodic sync?
  - Current implementation syncs automatically when cloud is reachable during policy refresh.

- Should the offline paging UI support selecting a specific microphone device?
  - Current implementation uses browser's default microphone.

## Device management architecture

- The repo contains both:
  - Config-sync (snapshots + deltas) documentation, and
  - A legacy tunnel proxy in `algo-bridge-relay/relayServer.js`.

Questions:

- Which path is actively used in production for device web UI / config access?
- Is config-sync Step 2/3 (backend endpoints + frontend editor) fully implemented and deployed?

## Image display

- How are 8410/8420 devices identified and filtered in the UI?
  - Some UI mentions exist.
  - Full authoritative rule set is **UNKNOWN**.

- What is the intended signed URL expiry policy for image display?
  - Backend has a configurable expiry (`IMAGE_DISPLAY_SIGNED_URL_EXP_SECONDS`) with a default.
  - **UNKNOWN**: what value is mandated for production and whether it differs for upload vs download.

## SIP

- Tenant identification in `/api/v2/voice/sip-router` currently loops through all tenants.
  - Is there a production mapping/caching strategy?

## SIP Paging (Phase S1 hardening)

- **RESOLVED**: Twilio webhook endpoints used by SIP paging are exempt from generic IP-based rate limiting when `X-Twilio-Signature` is valid.

- **RESOLVED**: SIP paging zone domain validation ignores `:port` when matching SIP URIs against tenant SIP domain.

- How should the system produce an audit-grade, tenant-scoped record of SIP paging call outcomes?
  - Current flow authorizes a zone and later receives a Twilio `CallSid` during token consumption.
  - Current Twilio status aggregation attempts to infer tenant from From/To numbers, which may be unreliable for SIP paging.

- What are the mandated production rate limits for SIP paging start attempts?
  - Per-user, per-tenant, and per-zone throttles need explicit policy.

- Should the direct `targetSip` mode on `/api/twilio/sip-connect` be disabled in production?
  - It is signature-gated, but can still expand blast radius if Twilio configuration is wrong.

- What are the required operator-visible failure messages for SIP paging vs RTP paging fallback?
  - Message/state definitions should be standardized for support.

## Security

- Where are device credentials stored (if at all), and how are they protected?
- What is the intended policy for TLS certificate validation for private-IP devices?
  - Agent supports TLS TOFU, but the policy defaults and admin controls are **UNKNOWN** in docs.
