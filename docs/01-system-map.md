# System Map (Authoritative)

## Major Components

| Component | Repo Folder | Runs Where | Primary Responsibility | Explicitly Does NOT Do |
|---|---|---|---|---|
| `Canalerts` | `/Canalerts` | Cloud-hosted web app (Firebase Hosting) | Admin/operator UI. Calls backend APIs. Runs paging UI and image-display UI. | Does not talk to LAN devices directly. |
| `algo-bridge-backend` | `/algo-bridge-backend` | Cloud Run (Flask) | Control plane: auth/tenant scoping, action dispatch, paging session start/stop (via MQTT, Phase 2), SIP router endpoint for Twilio, issues install tokens, publishes MQTT commands to agents, persists state in Firestore. | Does not directly reach customer LAN devices over IP. Does not carry real-time audio media. |
| `algo-network-agent` | `/algo-network-agent` | Edge (customer LAN workstation / mini-PC / server). Electron UI host (optional) + headless agent (Node). | **LAN execution boundary**. Executes LAN-scoped actions (RTP paging, device REST actions). Connects outbound to MQTT + backend for policy/commands. Hosts local WebSocket `/ws/live-audio` for RTP paging media-plane. | Does not implement tenant authorization beyond using its assigned identity. Does not carry SIP paging media (SIP is Twilio + cloud). |
| `algo-bridge-relay` (Paging Bridge + legacy tunnel) | `/algo-bridge-relay` | Cloud Run (Node) | Two roles exist in this repo:<br><br>1) **Paging Bridge** (`pagingBridge.js`): ~~WebSocket control-plane router for paging sessions~~ **DEPRECATED for paging (Phase 2)**. Paging control-plane now uses MQTT. May remain deployed for legacy compatibility during rollout.<br><br>2) **Legacy tunnel/relay** (`relayServer.js`): WebSocket-based HTTP proxy under `/relay` and `/proxy/:sid` (admin-only / diagnostic). | Paging Bridge does not transport audio media. Legacy tunnel is not the canonical device-management path. |
| `audio-relay` | `/audio-relay` | Cloud Run (Node) | Optional WebSocket relay for live paging audio frames when direct browser→agent WebSocket is not possible. Pairs `role=browser` and `role=agent` sockets by `sessionId` with JWT auth. | Does not speak RTP to devices. Does not decide paging targets/zones. |

## Notes

- The frontend uses MUI components in at least some admin pages (e.g., `ActionsPage.jsx`).
- `audio-relay` listens on WebSocket path `/ws/audio`.
- In diagrams, “SB” icons represent **user workspaces** (operator home screens), not deployable services.

## Agent Role and Multi-Agent Semantics (Current)

The agent is the system’s **LAN execution boundary**:

- Device actions (image display, door triggers, etc.) are executed on the LAN by an agent.
- RTP paging media-plane (RTP multicast) is emitted by an agent.

Multi-agent behavior (current constraints):

- Multiple agents per tenant are possible, but **routing is explicit**.
  - Online RTP paging targets a specific agent ID (for Phase 2, typically `PAGING_DEFAULT_AGENT_ID` unless an explicit agent is chosen).
  - Device actions target the agent referenced by the device record field `device.agentId`.
- If multiple agents can reach the same physical device, and both report inventory, the `device.agentId` association can change over time (last-writer wins on inventory upsert).

## Online Paging Control-Plane (Phase 2)

As of Phase 2, online paging control-plane signaling uses MQTT instead of the Paging Bridge:
Two paging mechanisms exist: RTP paging (agent-based) and SIP paging (Twilio-based). See `docs/12-sip-paging.md`.

```
┌──────────┐     HTTP      ┌──────────────┐     MQTT      ┌─────────────────┐
│  Browser │──────────────▶│   Backend    │──────────────▶│      Agent      │
│          │               │              │               │                 │
│          │               │  Publish:    │               │  Subscribe:     │
│          │               │  agent/{id}/ │               │  agent/{id}/    │
│          │               │  command     │               │  command        │
│          │               │              │               │                 │
│          │               │              │◀──────────────│  Publish:       │
│          │◀──────────────│  Subscribe:  │     MQTT      │  agent/{id}/    │
│          │     HTTP      │  agent/{id}/ │               │  result         │
│          │   (wsUrl)     │  result      │               │                 │
└──────────┘               └──────────────┘               └─────────────────┘
```

**Key characteristics of Phase 2 online paging:**

- **MQTT-based**: Control-plane uses existing MQTT infrastructure (`agent/{id}/command`, `agent/{id}/result`)
- **Stateless**: No in-memory state in relay; MQTT broker handles routing
- **Horizontally scalable**: Backend can scale without single-instance constraints
- **Synchronous wsUrl return**: Backend waits up to 15s for agent reply before returning wsUrl to browser

### Paging Bridge Status (Phase 2)

- **DEPRECATED for paging**: Paging Bridge WebSocket signaling is no longer required when Phase 2 is enabled
- **May remain deployed**: For legacy compatibility during rollout or for legacy tunnel/diagnostics
- **Feature flag**: `USE_MQTT_PAGING_CONTROL_PLANE` controls which path is used

## Capabilities already present (high-level)

- **Offline / degraded-network (CONFIRMED)**: The agent hosts local endpoints (`/ws/live-audio`, `POST /api/local/command`) that can operate without cloud connectivity once invoked.
- **RBAC / scoped permissions (CONFIRMED)**: Backend applies Firebase authentication and role checks for many APIs; paging introduces additional per-tenant role policies and zone allowlists.
- **Audit / traceability (CONFIRMED/IMPLIED)**:
  - Backend has a tenant events API (`tenants/{tenantId}/events`).
  - Agent writes a local `offline-audit.log` for certain local commands.

## Offline Paging Mode (Agent Operating Independently)

When Internet/cloud connectivity is unavailable, the agent can operate independently for paging:

```
┌─────────────────────────────────────────────────────────────────┐
│                        OFFLINE MODE                              │
│                  (No Cloud Components)                           │
│                                                                  │
│  ┌──────────────┐         ┌──────────────────────┐              │
│  │   Operator   │  HTTP   │  algo-network-agent  │              │
│  │   Browser    │────────▶│  (Edge / LAN)        │              │
│  │  (on LAN)    │         │                      │              │
│  │              │◀────────│  /offline-paging     │              │
│  │              │  HTML   │  /api/offline/...    │              │
│  │              │         │                      │              │
│  │              │   WS    │  /ws/live-audio      │              │
│  │              │────────▶│                      │              │
│  │              │  PCM16  │                      │              │
│  └──────────────┘         └──────────┬───────────┘              │
│                                      │                           │
│                                      │ RTP Multicast             │
│                                      ▼                           │
│                           ┌──────────────────────┐              │
│                           │   Algo Speakers      │              │
│                           │   (LAN Devices)      │              │
│                           └──────────────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

**Key characteristics of offline mode:**

- **No backend**: Agent does not contact `algo-bridge-backend`
- **No Paging Bridge**: Agent does not use `algo-bridge-relay`
- **No MQTT**: Agent does not require MQTT broker connectivity
- **No audio-relay**: Browser connects directly to agent on LAN
- **Cache-based**: Zone configuration comes from local `offline-paging-cache.json`
- **LAN-only trust**: No authentication; security relies on LAN access control

**Agent local endpoints for offline paging:**

| Endpoint | Method | Purpose |
|---|---|---|
| `/offline-paging` | GET | Minimal web UI for offline paging |
| `/api/offline/paging/zones` | GET | List cached paging zones |
| `/api/offline/paging/zone/:id` | GET | Resolve paging params for a zone |
| `/api/offline/paging/status` | GET | Cache status and diagnostics |
| `/ws/live-audio` | WS | Audio ingest (same as online mode) |
| `/api/local/command` | POST | Low-level start/stop RTP paging |

## Key Data Stores / External Services

| Service | Where | Used For |
|---|---|---|
| Firestore | Cloud (Firebase project `algobridge-36446`) | Tenants, users/claims, agents, devices, actions, paging config, SIP config, event logs. |
| MQTT Broker (EMQX over WSS/TLS) | Cloud | Backend→Agent commands (`agent/{id}/command`) and agent status/results (`agent/{id}/status`, `agent/{id}/result`). |
| Twilio | Cloud | SIP inbound webhook to backend (`/api/v2/voice/sip-router`), PSTN/SIP calling (per-tenant config), SMS/voice infrastructure. |

## Legacy / Do Not Extend

- `OLD-*`
- `algo-bridge-relay/relayServer.js` and `/proxy/...` paths are present but are not the canonical product path for device management.

## UNKNOWN

- Whether the Electron UI agent and the headless agent are both deployed in production for the same tenants, or if one is preferred.
- Whether any production workflows still rely on the legacy tunnel relay (vs config-sync / snapshots + deltas).
