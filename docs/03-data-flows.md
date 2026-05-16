# Data Flows

This document describes end-to-end flows across the system. Each flow includes:

- Initiator
- Step-by-step actions
- Which component performs each step
- Explicit separation between control-plane and media-plane

## User-Initiated Actions (Home Screen Mental Model)

Operators interact with the system through a **user workspace home screen / launcher** (see `docs/00-overview.md`). From a documentation and audit perspective:

- A user clicks a tile/button on the home screen.
- The platform executes the corresponding action path.

High-level pattern (online actions):

1. **User clicks a tile/button** in the launcher UI.
2. **Backend authorization** occurs (Firebase Auth + role/tenant scoping).
3. The action is executed via its specific execution path.

Important clarification:

- Tiles/buttons may look equivalent in the UI, but they can have different availability guarantees because they depend on different components.
- The UI does not necessarily pre-compute whether an action is available (Internet/Twilio/agent health). Many actions are attempted and may fail with an explicit error.
- “Paging” is not one implementation. The launcher can present both:
  - **RTP paging** (agent-based; can run in offline LAN-only mode)
  - **SIP paging** (Twilio-based; cloud-dependent)
- Device actions (image display, strobe, etc.) are separate action paths with their own dependencies.

## 1) Agent provisioning (install token)

### Purpose
Provision an agent identity (`agent-...`) without pre-creating an agentId on the edge.

### Initiator
Tenant admin (in UI / backend API) creates an install token.

### Steps (confirmed)

1. **Tenant admin requests install token**
   - **Initiator**: Admin UI / user
   - **Component**: `algo-bridge-backend`
   - **API**: `POST /api/v2/admin/agents/install-tokens`
   - **Result**: Backend returns `install_token` (opaque string, e.g. `ait_...`) and expiry.

2. **Agent starts with `AGENT_INSTALL_TOKEN`**
   - **Initiator**: `algo-network-agent` (headless host)
   - **Component**: `algo-network-agent`
   - **Behavior**: On startup, if `AGENT_ID` not set, it POSTs install token to backend.

3. **Agent registers using install token**
   - **Initiator**: `algo-network-agent`
   - **Component**: `algo-bridge-backend`
   - **API**: `POST /api/v2/agents/register/install`
   - **Result**: Backend creates a new agent document with ID `agent-<8 hex>` and returns an agent JWT token.

4. **Agent persists assigned identity**
   - **Initiator**: `algo-network-agent`
   - **Component**: `algo-network-agent`
   - **Behavior**: Stores `agentAssignedId` and JWT in its headless storage so identity survives restarts (if `HEADLESS_STORAGE_PATH` is set).

### Capability Notes

- **Role-based authorization (CONFIRMED)**: Install token minting is role-gated in the backend (`admin` / `tenant_admin`).
- **Scoped permissions (CONFIRMED)**: Tenant admins can only mint install tokens for their own tenant.
- **Audit / traceability (IMPLIED)**: The backend logs security events for some agent admin operations. Whether all install-token events are persisted beyond application logs is **UNKNOWN**.
- **Offline / degraded-network (CONFIRMED)**:
  - The install-token registration itself requires backend connectivity.
  - Once provisioned, the agent persists its identity locally and can restart without repeating provisioning.

### UNKNOWN

- Whether Electron UI mode uses the same install-token flow or uses a different activation mechanism.

## 2) Device discovery → device record update

### Purpose
Allow the platform to know what devices exist and what agent sees them.

### Confirmed pieces

- Backend supports inventory ingestion: `POST /api/v2/agents/<agent_id>/inventory/report` (agent-authenticated).
- Backend upserts devices into `tenants/{tenantId}/devices` based on inventory entries (prefers MAC as document ID when possible).

### UNKNOWN

- Which agent processes actually send inventory in production (Electron vs headless).
- Whether the system continuously scans or only scans on-demand.

## 3) Image upload + display (Algo 8410/8420)

### Purpose
User selects an image and (optionally) overlay text. The image is uploaded and displayed on an Algo 8410/8420 screen.

### Initiator
Operator user in `Canalerts` UI.

### Control-plane vs media-plane

- **Control-plane**:
  - Browser → Backend (`/api/v2/media/image-display/upload-url`, `/api/v2/media/image-display/dispatch`)
  - Backend → MQTT broker → Agent (`agent/<agentId>/command`, action `image_display`)
- **Data-plane**:
  - Browser → GCS (signed `PUT` upload URL)
  - Agent → GCS (signed `GET` download URL)
  - Agent → Algo device (LAN HTTP/HTTPS)

### Steps (confirmed)

1. **User selects an image in UI**
   - **Component**: `Canalerts`

2. **UI requests signed URLs**
   - **Component**: `Canalerts` → `algo-bridge-backend`
   - **API**: `POST /api/v2/media/image-display/upload-url`
   - **Result**:
     - `uploadUrl` (signed `PUT`) + `downloadUrl` (signed `GET`)
     - `objectPath` under `image-display/<tenantId>/...`
     - `expiresInSeconds` (configured in backend; default is 900 seconds)

3. **Browser uploads image directly to GCS**
   - **Component**: `Canalerts` → GCS
   - **Transport**: HTTPS `PUT` to `uploadUrl` (binary body)

4. **UI requests an image display dispatch**
   - **Component**: `Canalerts` → `algo-bridge-backend`
   - **API**: `POST /api/v2/media/image-display/dispatch`
   - **Payload includes**: `tenantId`, `deviceId`, `imageUrl` (signed `downloadUrl`), `filename`, optional `overlayText`
   - **Result**: HTTP `200` means the backend published the command to MQTT; it does not guarantee the device displayed successfully.

5. **Backend publishes `image_display` command over MQTT**
   - **Component**: `algo-bridge-backend` → MQTT broker → `algo-network-agent`
   - **Topic**: `agent/<agentId>/command`

6. **Agent executes device REST sequence**
   - **Component**: `algo-network-agent`
   - **Device calls** (as implemented):
     - `PUT https?://<deviceIp>[:port]/api/files/images/<filename>` (binary body)
     - `POST <same scheme+host>/api/controls/screen/start` (JSON)
     - Optional delayed `POST .../api/controls/screen/stop`

### Capability Notes

- **Role-based authorization (CONFIRMED)**: Dispatch endpoints are backend-controlled and require authenticated access.
- **Backend is not a data-plane (CONFIRMED)**: Image bytes do not traverse backend services.
- **Dispatch semantics (CONFIRMED)**: HTTP `200` from dispatch means the command was published to MQTT; it does not guarantee the device displayed the image.
- **Signed URL properties (CONFIRMED)**:
  - Object naming is constrained by backend to `image-display/<tenantId>/<uuid>.<ext>`.
  - Bucket defaults to `algobridge-media` unless overridden by environment.
- **Degraded-network behavior (CONFIRMED)**:
  - If agent cannot fetch from GCS (no outbound HTTPS) or cannot reach the device on the LAN, display fails at the agent.
  - If the agent is not connected to MQTT or not running, the command will not be processed.

### UNKNOWN

- Device model detection rules (how UI restricts to 8410/8420) beyond what is shown in the Actions UI.

## 4) Online Paging / Live Audio (Cloud-Initiated)

### Purpose
Send live audio (from a browser microphone) to the agent, and the agent converts that audio to RTP multicast (or other target) on the LAN.
SIP paging/calling is documented separately in `docs/12-sip-paging.md` and is distinct from RTP paging.

This flow corresponds to the launcher’s **RTP paging** button/tile.
The launcher may also present a **SIP paging** button/tile, but that is a different execution path (browser → Twilio → SIP endpoint) with different availability constraints.

### Initiator
Operator user in `Canalerts` UI.

### Control-plane vs media-plane (Phase 2)

- **Control-plane**: Browser → Backend (HTTP) → MQTT Broker → Agent (MQTT)
- **Media-plane**: Browser → Agent (WS) OR Browser → Audio Relay → Agent (WS)
- **LAN RTP**: Agent → multicast group + port (RTP)

~~Legacy (pre-Phase 2): Control-plane used Paging Bridge WebSocket instead of MQTT.~~

### Steps (Phase 2 - MQTT Control-Plane)

1. **UI requests a paging session**
   - **Component**: `Canalerts` → `algo-bridge-backend`
   - **API**: `POST /api/paging/session/start`
   - **Payload includes**: `zoneId`, optional `override`, optional `target`.

2. **Backend validates + builds paging payload**
   - **Component**: `algo-bridge-backend`
   - **Code**: `handlers/paging_admin.py` (RBAC + zone config + durations)
   - **Generates**: `sessionId`, `requestId` for correlation

3. **Backend publishes `start_paging_session` to MQTT**
   - **Component**: `algo-bridge-backend` → MQTT broker
   - **Topic**: `agent/{agentId}/command`
   - **Message type**: `start_paging_session`
   - **Payload includes**: `requestId`, `sessionId`, `tenantId`, `paging` (zone params), `mediaMode` hints

4. **Agent receives command and generates wsUrl**
   - **Component**: `algo-network-agent`
   - **Handler**: Listens on `agent/{id}/command` for `start_paging_session`
   - **Action**: Validates zone, prepares RTP, generates `wsUrl`

5. **Agent publishes `paging_session_ready` to MQTT**
   - **Component**: `algo-network-agent` → MQTT broker
   - **Topic**: `agent/{agentId}/result`
   - **Message type**: `paging_session_ready`
   - **Payload includes**: `requestId`, `sessionId`, `agentId`, `wsUrl`

6. **Backend receives reply and returns wsUrl to browser**
   - **Component**: `algo-bridge-backend`
   - **Behavior**: Waits up to 15s for correlated reply (by `requestId`)
   - **HTTP Response**: `200 OK` with `{sessionId, agentId, wsUrl}`

7. **Browser connects to `wsUrl` and streams audio**
   - **Component**: `Canalerts`
   - **Transport**: WebSocket
   - **Two supported paths**:
     - **Direct**: `ws://<agentHost>:<agentPort>/ws/live-audio?...`
     - **Via audio-relay** (when backend provided `audioRelayUrl` + JWT): `wss://<audio-relay>/ws/audio?role=browser&sessionId=...&token=...`

8. **Agent converts audio to RTP and sends on LAN**
   - **Component**: `algo-network-agent`
   - **Local WS endpoint**: `/ws/live-audio` (handled by `agent/rtpServer.js`)
   - **LAN output**: RTP to multicast `group:port` with `ttl`.
   - **Audio format**: PCM16, 8kHz, mono

9. **Stop paging**
   - **Component**: `Canalerts` → backend `POST /api/paging/session/stop`
   - **Backend action**: Publishes `stop_paging_session` to `agent/{agentId}/command` (fire-and-forget)
   - **Alternative**: Closing the media WebSocket also stops the session

### Failure Modes (Phase 2)

| Failure | Impact | HTTP Response |
|---------|--------|---------------|
| MQTT broker unreachable | Cannot start new sessions | 503 Service Unavailable |
| Agent not connected to MQTT | Backend times out waiting for reply | 504 Gateway Timeout |
| Agent returns error | Error propagated to browser | 400/404/500 (mapped from `errorCode`) |
| Backend restarts mid-page | Active session continues (media-plane is decoupled) | N/A |
| Agent restarts mid-page | Session terminates (RTP stream stops) | Browser WS closes |
| MQTT unavailable mid-page | Active session continues (media-plane is direct WS) | N/A |

### Capability Notes

- **Zone-based alerting (CONFIRMED)**: Paging start is zone-based (`zoneId` → one or more multicast targets).
- **Role-based authorization (CONFIRMED)**:
  - Tenant admins can manage paging zones/settings.
  - Paging includes per-tenant role policy gates (e.g., `canPage`) and allowlists (for SIP paging zones).
- **Agent selection (Phase 2)**: Backend publishes directly to target agent's MQTT topic.
  - If `target` specified, use that agent
  - Else use `PAGING_DEFAULT_AGENT_ID` from config
- **Media-plane resilience (CONFIRMED)**: Two supported media-plane modes exist:
  - direct browser → agent `/ws/live-audio`
  - browser → `audio-relay` → agent
- **Control-plane / media-plane decoupling (Phase 2)**:
  - Control-plane (MQTT) is only used for session start/stop signaling
  - Media-plane (WebSocket) operates independently once session is established
  - Active sessions survive backend/MQTT outages
- **Audit / traceability (CONFIRMED/IMPLIED)**:
  - Agent supports a local `offline-audit.log` for certain locally-invoked paging commands.
  - Backend logs paging events with `requestId`, `sessionId`, `tenantId`, `agentId`.

### UNKNOWN

- ~~Exact audio encoding format used between browser and agent~~ **RESOLVED**: PCM16, 8kHz, mono.

## 4b) Offline Paging (Local Agent Only)

### Purpose

Enable on-site operators to page local devices when Internet/cloud connectivity is unavailable. This is a first-class, documented capability for degraded-network scenarios.

### Initiator

Operator user accessing the agent's local web UI or API directly from the LAN.

### Control-plane vs media-plane

- **Control-plane**: Browser → Agent (HTTP, LAN-only)
- **Media-plane**: Browser → Agent (WebSocket, LAN-only)
- **LAN RTP**: Agent → multicast group + port (RTP)

**No cloud components are involved in the offline paging runtime path (control/media/RTP).**
Offline paging audit logs are written locally first and can optionally be synced to Firestore when connectivity returns (see below).

### Prerequisites

- Agent has previously synced paging zone configuration while online
- Agent is running and reachable on the LAN
- Operator has LAN access to the agent host

### Steps (confirmed)

1. **Operator navigates to offline paging UI**
   - **Component**: Browser → `algo-network-agent`
   - **URL**: `http://<agent-host>:3000/offline-paging`
   - **Result**: Agent serves a minimal HTML/JS paging interface

2. **UI fetches cached paging zones**
   - **Component**: Browser → `algo-network-agent`
   - **API**: `GET /api/offline/paging/zones`
   - **Result**: List of zones with multicast group(s), port(s), and names from local cache

3. **Operator selects a zone to page**
   - **Component**: Browser
   - **Action**: User clicks "Page" button for a zone

4. **UI resolves paging parameters**
   - **Component**: Browser → `algo-network-agent`
   - **API**: `GET /api/offline/paging/zone/:zoneId`
   - **Result**: `{ group, port, ttl, zoneName }`

5. **Browser connects to agent WebSocket**
   - **Component**: Browser → `algo-network-agent`
   - **Transport**: WebSocket to `/ws/live-audio?group=<ip>&port=<port>&ttl=<ttl>&commandId=offline-<ts>`

6. **Browser streams microphone audio**
   - **Component**: Browser
   - **Format**: PCM16, 8kHz, mono (same as online paging)
   - **Transport**: Binary WebSocket frames

7. **Agent converts audio to RTP and sends on LAN**
   - **Component**: `algo-network-agent`
   - **Handler**: `agent/rtpServer.js` → `agent/rtpHandler.js`
   - **Output**: RTP to multicast `group:port` with `ttl`

8. **Operator stops paging**
   - **Component**: Browser
   - **Action**: User clicks "Stop Paging" or closes the page
   - **Result**: WebSocket closes, RTP stream stops

### Capability Notes

- **No cloud dependency (CONFIRMED)**: Entire flow operates on LAN without backend, MQTT, Paging Bridge, or audio-relay.
- **Cache-based zone resolution (CONFIRMED)**: Zones are resolved from local `offline-paging-cache.json`, not fetched from cloud.
- **No authentication (CONFIRMED)**: Offline paging endpoints do not require authentication; security relies on LAN-only access.
- **Audit logging (CONFIRMED)**: Paging commands are logged to local `offline-audit.log` when available.
- **Offline audit sync (CONFIRMED)**: When enabled, the agent can sync those local audit events to Firestore after connectivity returns.
- **Same audio format (CONFIRMED)**: Uses identical PCM16 8kHz mono format as online paging.

### Failure modes

- **Cache not populated**: If agent has never synced while online, no zones are available. UI displays "No zones cached."
- **Stale cache**: If zones were modified in cloud after last sync, offline UI shows outdated zone configuration.
- **Agent unreachable**: If operator cannot reach agent on LAN, offline paging is not possible.
- **Microphone denied**: If browser does not have microphone permission, audio capture fails.

### Cache sync behavior

- **When**: Agent syncs paging zones when cloud is reachable during periodic policy refresh (default every 5 minutes)
- **Where**: Cache stored in `offline-paging-cache.json` in agent's data directory
- **What**: Zones with `id`, `name`, `active`, `multicastGroups` (each with `group`, `port`, optional `ttl`)

### Offline audit sync behavior (Implemented, feature-flagged)

- **Source of truth**: local append-only JSONL file `offline-audit.log`
- **Trigger**: agent detects being online (MQTT connect and/or heartbeat success)
- **Backend ingest**: `POST /api/v2/agents/offline-paging-audit/sync` (agent JWT auth)
- **Firestore write path**: `tenants/{tenantId}/offlinePagingAuditEvents/{eventId}`
- **Safety**: non-blocking for offline paging; retry-safe; cursor advances only after backend ack
- **Default**: disabled unless `OFFLINE_AUDIT_SYNC_ENABLED=true`

## 5) SIP calling (Twilio)

### Purpose
Handle inbound SIP calls to a tenant’s Twilio SIP domain, normalize/route them, and return TwiML.

### Initiator
Twilio Voice webhook.

### Steps (confirmed)

1. **Twilio calls backend SIP router**
   - **Component**: Twilio → `algo-bridge-backend`
   - **API**: `POST /api/v2/voice/sip-router`
   - **Auth**: `X-Twilio-Signature` validation (unless disabled by env).

2. **Backend identifies tenant by SipDomainSid**
   - **Component**: `algo-bridge-backend`
   - **Current behavior**: Iterates tenants and checks `tenants/{tenantId}/sipConfig/default.sipDomainSid`.

3. **Backend applies tenant dial plan + policy**
   - Rate limiting (Redis token bucket; fails open if Redis unavailable)
   - Blocked prefixes
   - PSTN enable/disable
   - SIP vs PSTN decision

4. **Backend returns TwiML**
   - SIP: `<Dial><Sip>...</Sip></Dial>`
   - PSTN: `<Dial callerId=... timeLimit=...>+E164</Dial>`

### UNKNOWN

- Whether Twilio status callbacks or call event logging beyond `log_incoming_event()` are used for production observability.
