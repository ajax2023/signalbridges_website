# Deployment Scope

This document maps each component to where it runs and what network conditions it expects.

## Component deployment table

| Component | Runtime location | Internet exposure | Device access | Latency sensitivity |
|---|---|---|---|---|
| `Canalerts` (web frontend) | Cloud (Firebase Hosting) | Public HTTPS | None directly (must call backend) | Medium (UI + paging start UX) |
| `algo-bridge-backend` | Cloud Run (Flask) | Public HTTPS (API endpoints) | No direct LAN device access | Medium (paging start is synchronous HTTP) |
| GCS bucket (`algobridge-media`) | Cloud (Google Cloud Storage) | Public HTTPS (via signed URLs) | None directly | Medium (image display upload/download) |
| `algo-network-agent` | Edge (customer workstation / mini-PC / server) | Typically outbound-only (MQTT + HTTPS). May also host a local HTTP/WS server for browser paging and local commands. | Yes (HTTP/HTTPS to Algo devices, multicast for paging) | High for paging media; medium for device actions |
| `algo-bridge-relay` (Paging Bridge) | Cloud Run (Node WebSocket server) | Public WSS (backend + agents connect) | None directly | Medium (paging session setup) — **DEPRECATED for paging in Phase 2** |
| `audio-relay` | Cloud Run (Node WebSocket server) | Public WSS | None directly | High (real-time audio frames) |
| `algo-bridge-relay` (legacy tunnel proxy) | Cloud Run (Node WebSocket + HTTP) | Public HTTPS/WSS | Indirect (proxy to agent) | Medium/High depending on usage |

## Notes and constraints

- **Outbound edge connectivity is assumed**:
  - Agent connects out to MQTT broker (WSS/TLS) and backend (HTTPS).
  - For image display, agent also connects out to GCS (HTTPS) to fetch images via signed download URLs.

- **Inbound connectivity MAY exist** depending on deployment:
  - Browsers may connect directly to agent `/ws/live-audio` for paging.
  - If that is not possible, `audio-relay` is used.

## Agent Deployment Forms (Bundled vs Standalone)

The system supports multiple **agent deployment forms**. These forms differ primarily in lifecycle guarantees.

### Standalone agent (recommended for production)

The standalone agent is deployed as a long-running process (typically as a native OS service) and is intended to:

- Run continuously independent of any user UI.
- Survive operator logouts and UI restarts.
- Restart on crash and start on boot.

Operational note:

- For headless deployments, **identity persistence requires a stable storage location** (e.g., `HEADLESS_STORAGE_PATH`).
- If identity storage is ephemeral, the agent can lose its assigned `agentId` across restarts.

### Bundled / supervised agent (lifecycle tied to UI)

In some distributions, the Electron application can **supervise** a packaged headless agent (spawn it and pass a `PARENT_PID`). In this mode:

- Agent lifecycle can be tied to the UI lifecycle.
- If the supervising UI process exits, the child agent can intentionally exit to avoid becoming an orphan process.

This mode is suitable for:

- Demos
- Small sites where a dedicated always-on edge server is not available

This mode is **not recommended** where “agent always-on” is an enterprise requirement.

### Duplicate `agentId` risk (all forms)

- If two machines run with the same `AGENT_ID` (e.g., VM cloning or copying `.env` / storage), both can subscribe to `agent/{agentId}/command` and may execute the same commands.
- This is a deployment-time risk; production deployments should treat `AGENT_ID` as a secret-like identifier that must not be cloned.
- **Phase B**: Second agent with same `agentId` receives 409 CONFLICT and exits immediately.

- ~~**Cloud Run scaling caveat (Paging Bridge)**~~:
  - ~~Paging Bridge stores agent/backend connections in-memory per instance.~~
  - ~~Running multiple instances can cause backend and agent to land on different instances.~~
  - **RESOLVED (Phase 2)**: Paging control-plane now uses MQTT. No single-instance constraint for paging.

### Multi-agent deployments (Phase C: Segment-Based Authority)

Multi-agent deployments require explicit segment configuration:

1. **Create segments** for each logical grouping of devices
   - `POST /api/v2/admin/segments`
   - Segment ID format: `tenantId/siteId/segmentKey`

2. **Assign primary agent** to each segment
   - `POST /api/v2/admin/segments/<segment_id>/assign-agent`
   - Only one primary agent per segment

3. **Assign devices** to segments
   - `POST /api/v2/admin/segments/<segment_id>/devices`
   - Bulk assignment supported

**Operational requirements**:
- Standalone agents recommended for segments (always-on)
- No agent-to-agent coordination required
- Admin recovery via segment reassignment (not per-device)

### Phase C.1: Automatic Failover Configuration (Recommended for Enterprise)

For production deployments requiring high availability:

1. **Configure standby agents** for each segment
   - `POST /api/v2/admin/segments/<segment_id>/standbys`
   - Request: `{ "standbyAgentIds": ["agent-standby-1", "agent-standby-2"] }`
   - Order matters: first healthy standby is promoted

2. **Enable auto-failover** (enabled by default)
   - `POST /api/v2/admin/segments/<segment_id>/auto-failover`
   - Request: `{ "enabled": true, "cooldownSeconds": 300 }`

3. **Monitor segment health**
   - `GET /api/v2/admin/segments/<segment_id>/health`
   - Returns: primary health, standby health, overall status

**Enterprise recommendations**:
- Configure **at least 1 standby agent** per segment for automatic recovery
- Use **standalone always-on agents** for both primary and standby roles
- Set **cooldownSeconds** to 300+ to prevent flapping (default: 300)
- Monitor `segmentFailoverAudit` collection for failover events

**Failover behavior**:
- If primary agent becomes unhealthy, first healthy standby is automatically promoted
- Failover is atomic and audited
- No manual intervention required for recovery
- Tenants do not need to monitor individual agents

## Online Paging Dependencies (Phase 2)

**Hard dependencies for starting a new paging session:**

| Dependency | Required For | Failure Mode |
|------------|--------------|---------------|
| `algo-bridge-backend` | Session start API | HTTP 5xx |
| MQTT broker (EMQX) | Control-plane signaling | HTTP 503/504 |
| `algo-network-agent` | Session handling, wsUrl generation | HTTP 504 (timeout) |

**NOT required for starting a paging session (Phase 2):**

- Paging Bridge (`algo-bridge-relay`) — deprecated for paging control-plane
- Audio-relay — only needed if direct browser→agent WS is not possible

**Active session resilience:**

- Once a paging session is started and the browser has connected to `wsUrl`, the session continues even if:
  - Backend restarts (control-plane is decoupled from media-plane)
  - MQTT broker is temporarily unavailable (media-plane is direct WS)
- Session terminates if:
  - Agent restarts (RTP stream stops)
  - Browser closes WebSocket connection

## Resilience and degraded-network behavior

### Paging Bridge (control-plane) — DEPRECATED for Paging (Phase 2)

~~- **CONFIRMED**: If the backend is connected to a Paging Bridge instance that has no agents connected, paging start fails with an error (`No agents connected to bridge`).~~
~~- **CONFIRMED**: If Paging Bridge scales to multiple instances, backend and agents can connect to different instances. Because state is in-memory per instance, this can present as "no agents connected" even when some agents are connected elsewhere.~~

**Phase 2 update**: Paging control-plane now uses MQTT instead of Paging Bridge. The above failure modes no longer apply when Phase 2 is enabled. MQTT broker handles message routing; no in-memory state in relay components.

### MQTT Broker (paging control-plane, Phase 2)

- **CONFIRMED**: If MQTT broker is unreachable, paging session start fails (backend returns 503).
- **CONFIRMED**: If agent is not connected to MQTT, paging session start times out (backend returns 504 after 15s).
- **CONFIRMED**: Active paging sessions are NOT affected by MQTT outages (media-plane is direct browser→agent WS).

### Image display (control-plane + data-plane)

- **CONFIRMED**: Image bytes do not traverse backend services.
- **Control-plane dependency (CONFIRMED)**: Backend dispatches `image_display` as an MQTT command to a specific agent.
- **Data-plane dependencies (CONFIRMED)**:
  - Browser uploads the image to GCS via a signed `PUT` URL.
  - Agent downloads the image from GCS via a signed `GET` URL.
- **Failure modes (CONFIRMED)**:
  - If the browser cannot reach GCS, image upload fails and the UI should not dispatch.
  - If the agent cannot reach GCS or the signed download URL has expired, the agent cannot fetch the image.
  - If the agent cannot reach the device on the LAN, the device display sequence fails.

### Agent (edge)

- **CONFIRMED**: The agent exposes local endpoints that can operate without cloud connectivity:
  - WebSocket `/ws/live-audio`
  - HTTP `POST /api/local/command` supporting `start_rtp_paging` / `stop_rtp_paging`
  - HTTP `GET /api/offline/paging/zones` - list cached paging zones
  - HTTP `GET /api/offline/paging/zone/:zoneId` - resolve paging parameters for a zone
  - HTTP `GET /offline-paging` - minimal local web UI for offline paging

## Offline Paging Mode

### Purpose

Enable on-site operators to page local devices when Internet/cloud connectivity is unavailable.

### Required conditions

- Agent is running and reachable on the LAN (default port 3000)
- Agent has previously synced paging zone configuration while online
- Operator has LAN access to the agent host (browser on same network or localhost)
- Microphone access is available in the operator's browser

### Capabilities (what offline paging CAN do)

- Page to any zone that was cached during the last successful sync
- Use the same RTP multicast output as online paging
- Operate indefinitely without cloud connectivity once cache is populated
- Log paging commands to local `offline-audit.log`

### Limitations (what offline paging CANNOT do)

- Page to zones that were created/modified after the last cache sync
- Enforce cloud-side RBAC policies (no user authentication in offline mode)
- Record paging events to Firestore or cloud audit logs
- Use audio-relay mode (requires cloud connectivity)
- Provide end-to-end confirmation that devices received the page

### Operator entry point

- **Primary**: Navigate to `http://<agent-host>:3000/offline-paging` from a browser on the LAN
- **Fallback**: Use the local REST API directly:
  1. `GET /api/offline/paging/zones` to list available zones
  2. Connect WebSocket to `/ws/live-audio?group=<ip>&port=<port>&ttl=<ttl>`
  3. Stream PCM16 8kHz mono audio frames

### Network assumptions

- Operator browser must be on the same LAN as the agent (or have routed access)
- Agent listens on `0.0.0.0:3000` by default (configurable via `PORT` env var)
- No authentication is required for offline paging endpoints (LAN-only trust model)

### Cache behavior

- **Sync trigger**: Agent syncs paging zones when cloud is reachable during periodic policy refresh (default every 5 minutes)
- **Persistence**: Cache is stored in `offline-paging-cache.json` in the agent's data directory
- **Stale cache**: If cache is outdated, operator sees zones as they were at last sync; no automatic refresh occurs offline
- **Missing cache**: If agent has never synced, offline paging UI shows "No zones cached"

## UNKNOWN

- ~~Whether `algo-bridge-relay` is configured as single-instance in all environments.~~ **RESOLVED (Phase 2)**: No longer relevant for paging; MQTT replaces Paging Bridge.
- Whether end-user browsers are expected to have direct routability to the agent host in production.
