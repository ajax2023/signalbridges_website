# Transports

This document lists the transports/protocols used between components.

## Transport matrix

| Transport | Where used | Direction | Purpose | Required / Optional / Legacy |
|---|---|---|---|---|
| HTTPS (REST) | Browser ↔ Backend | Both | Admin/operator UI calls backend APIs (actions, paging, admin). | Required |
| HTTPS (REST) | Browser ↔ GCS (signed URLs) | Browser → GCS | Image upload (image display data-plane). | Required for image display |
| HTTPS (REST) | Agent ↔ GCS (signed URLs) | Agent → GCS | Image download (image display data-plane). | Required for image display |
| ~~WebSocket (WSS)~~ | ~~Backend ↔ Paging Bridge (`algo-bridge-relay`)~~ | ~~Both~~ | ~~Control-plane signaling for paging sessions.~~ | **DEPRECATED for paging (Phase 2)** — MQTT replaces this |
| WebSocket (WS/WSS) | Browser ↔ Agent (`/ws/live-audio`) | Browser → Agent (bi-directional socket) | Live paging audio frames (media-plane) in direct-connect mode. | Optional (depends on network) |
| WebSocket (WSS) | Browser ↔ Audio Relay (`/ws/audio`) | Browser ↔ Relay | Live paging audio frames when direct browser→agent is not possible. | Optional |
| WebSocket (WSS) | Agent ↔ Audio Relay (`/ws/audio`) | Agent ↔ Relay | Agent side of audio relay; forwards frames into local agent `/ws/live-audio`. | Optional |
| MQTT over WSS/TLS | Backend ↔ MQTT broker ↔ Agent | Both | Commands (`agent/{id}/command`, incl `image_display`, `start_paging_session`, `stop_paging_session`), results (`agent/{id}/result`, incl `paging_session_ready`, `paging_session_error`), status (`agent/{id}/status`). | Required for agent command/control and **paging control-plane (Phase 2)** |
| HTTP/HTTPS (REST) | Agent ↔ Algo devices | Both | Device operations (config, image display, REST actions). | Required for device control |
| RTP (multicast/unicast) | Agent → LAN | Agent → devices | Paging audio output from agent to speakers/receivers on LAN. | Required for RTP paging feature |
| SIP (via Twilio) | External ↔ Twilio ↔ Backend | Both | Inbound SIP routing policies and TwiML generation. | Optional (feature-dependent) |
| Legacy HTTP proxy over WS | Browser/Backend ↔ `algo-bridge-relay/relayServer.js` ↔ Agent ↔ Device | Both | Legacy tunnel under `/relay` and `/proxy/:sid`. | Legacy (admin-only / diagnostics) |

## Notes

- The paging system intentionally splits:
  - **Control-plane** (backend → MQTT → agent signaling, Phase 2) from
  - **Media-plane** (audio frames + RTP).

- **Phase 2 paging control-plane**: Uses MQTT instead of Paging Bridge WebSocket.
  - Backend publishes `start_paging_session` to `agent/{id}/command`
  - Agent replies with `paging_session_ready` on `agent/{id}/result`
  - No persistent WebSocket connection to Paging Bridge required

## Security / authorization and traceability

### HTTPS (Browser ↔ Backend)

- **CONFIRMED**: Backend endpoints use Firebase authentication (`Authorization: Bearer <Firebase ID token>`) and role-based access control for many routes.
- **CONFIRMED**: Some endpoints support alternate forwarded auth headers (e.g., `X-Firebase-Authorization`) and, for a limited set of paths, a `token` query parameter workaround.
- **CONSTRAINT**: Auth header workarounds are endpoint/path specific.

### MQTT (Backend ↔ Agent)

- **CONFIRMED**: MQTT topics encode the agent scope (`agent/{id}/command`, `agent/{id}/status`, `agent/{id}/result`).
- **IMPLIED**: Broker-side authentication/authorization exists but is configured outside this repo (broker settings are deployment-specific).

### WebSocket control-plane (Backend ↔ Paging Bridge ↔ Agent) — DEPRECATED for Paging (Phase 2)

~~- **CONFIRMED**: Paging Bridge is a message router; it does not validate tenant permissions.~~
~~- **CONSTRAINT / FAILURE MODE**: Paging Bridge routing is instance-local; multi-instance deployments can split connectivity.~~

**Phase 2 update**: Paging control-plane now uses MQTT. The above constraints no longer apply for paging when Phase 2 is enabled.

### MQTT control-plane for paging (Phase 2)

- **CONFIRMED**: Backend publishes paging commands to agent-specific MQTT topics.
- **CONFIRMED**: Agent replies on `agent/{id}/result` with correlation by `requestId`.
- **CONFIRMED**: No in-memory state in relay components; MQTT broker handles routing.
- **CONFIRMED**: Backend waits up to 15s for agent reply before timing out.

### WebSocket media-plane

- **CONFIRMED**: Media-plane can be direct browser → agent (`/ws/live-audio`) or via `audio-relay` (`/ws/audio`).
- **CONSTRAINT / UNKNOWN**: The authentication model for direct browser → agent media sockets is not documented here.

### Audit / traceability

- **CONFIRMED**: Backend logs auth/RBAC decisions to application logging.
- **CONFIRMED**: Agent writes `offline-audit.log` for certain locally-invoked commands.
- **UNKNOWN**: Whether all operator actions are recorded to a persistent, queryable audit trail (e.g., Firestore `events`) is not proven by this docs set.

## UNKNOWN

- Whether any deployments use additional transports (e.g., SIP registration directly to Twilio from non-agent endpoints) beyond what is represented in the current repos.
