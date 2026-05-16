# Agent Architecture (Authoritative)

This document defines the authoritative **agent model** for Canalerts / Algo Bridge.
It exists to remove ambiguity around:

- Agent identity and trust
- How agents bind to tenants and devices
- Multi-agent semantics
- Bundled vs standalone deployment forms
- Lifecycle, upgrades, and failure behavior

This is an audit-grade description of **current implemented behavior** and **Phase B hardening guarantees**.

## 1) Definitions

- **Agent**: Edge software instance that can reach LAN devices and execute LAN-scoped actions.
- **Agent ID (`agentId`)**: The unique identifier used for:
  - Firestore document ID in `agents/{agentId}`
  - MQTT topic namespace `agent/{agentId}/...`
  - Agent JWT identity (`sub`)
- **Tenant binding**: The association between an agent and a tenantId (stored in the agent document and typically included in agent-issued tokens).

## 2) Agent responsibilities (what the agent DOES)

The agent is the system’s **LAN execution boundary**.

- **RTP paging execution**
  - Receives paging start command (Phase 2 control-plane over MQTT).
  - Hosts `/ws/live-audio` for browser audio ingest (direct or via audio-relay).
  - Emits RTP multicast on the LAN.
  - Supports **offline paging** via local UI `/offline-paging` and local REST endpoints.

- **Device control execution**
  - Receives device-action commands over MQTT.
  - Executes REST/HTTPS calls to Algo devices (including TLS TOFU support where enabled).

- **Device discovery / inventory reporting**
  - May report discovered device inventory to backend (backend supports signed inventory reports).

## 3) Agent boundaries (what the agent DOES NOT do)

- **Tenant authorization**
  - The backend is the tenant scoping and authorization boundary.
  - The agent is not expected to enforce tenant RBAC beyond using its assigned identity.

- **SIP paging**
  - SIP paging is cloud-only (Twilio + backend) and does not use the agent RTP pipeline.

## 4) Agent identity generation and persistence

Implemented provisioning flows:

- **Install token registration (v2)**
  - Admin creates token: `POST /api/v2/admin/agents/install-tokens`
  - Agent consumes token: `POST /api/v2/agents/register/install`
  - Backend creates a new agent ID (format: `agent-<8-hex>`) and stores it in `agents/{agentId}`.
  - Agent persists the assigned identity locally (headless storage) so it survives restarts.

- **Activation code flow (v2)**
  - `POST /api/v2/agents/activate`
  - Backend finds an existing `agents/{agentId}` document by `activation_code`, marks activation used, and returns `.env`-style values (including `AGENT_ID`, `AGENT_TENANT`, and MQTT settings).

Identity persistence requirements:

- Headless deployments should use a stable storage path (e.g., `HEADLESS_STORAGE_PATH`) to persist:
  - assigned agent ID
  - agent JWT token
  - token expiry
  - device ID

If identity is not persisted, the agent can lose its assigned identity across restarts.

## 5) Agent registration and trust model

### Agent JWT (backend API)

- Agents register and receive a long-lived JWT token.
- Agent-authenticated endpoints validate:
  - The request includes a valid agent JWT.
  - The agentId in the request matches the agentId in the token.
  - Tenant mismatch checks can reject requests when a request asserts a tenantId that differs from the stored tenant binding.

### MQTT trust

- The backend publishes commands to `agent/{agentId}/command`.
- The agent subscribes to its own command topics.

Critical constraint (pre-Phase B):

- If two processes run with the same `AGENT_ID`, both can subscribe to the same `agent/{agentId}/command` topic and can execute the same commands.

### Phase B: Agent Lease Model (Single-Active-Agent Guarantee)

**Guarantee**: At any time, at most one agent instance is considered "active" for a given `agentId`.

**Mechanism**:

- Each agent generates a unique `instanceId` (UUID) at process startup.
- On heartbeat, backend checks lease ownership:
  - If `leaseHolder == instanceId` → renew lease
  - If lease expired → acquire lease
  - If lease held by different instance → **reject with 409 CONFLICT**
- Agent receiving 409 CONFLICT **must exit immediately**.

**Lease fields** (stored in `agents/{agentId}`):

| Field | Type | Description |
|-------|------|-------------|
| `leaseHolder` | string | UUID of the active agent instance |
| `leaseExpiresAt` | timestamp | Server time when lease expires |
| `leaseAcquiredAt` | timestamp | When lease was last acquired/renewed |

**Lease TTL**: 90 seconds (configurable via `AGENT_LEASE_TTL_SECONDS`)

**Failure behavior**:

| Scenario | Behavior |
|----------|----------|
| Second agent starts with same `agentId` | Heartbeat returns 409; agent exits |
| Active agent crashes | Lease expires after TTL; next agent can acquire |
| Network partition | Agent cannot renew; should stop executing after local TTL check |

**Agent-side defense**: Agent tracks `lastHeartbeatAckTime` and refuses to execute commands if `now - lastHeartbeatAckTime > localTTL`.

**Implementation details** (Phase B):

- Backend: `handlers/v2/agent_api.py` → `report_heartbeat_v2()` uses Firestore transaction for atomic lease acquisition
- Agent: `agent/agentRuntime.js` generates `AGENT_INSTANCE_ID` at module load (not persisted)
- Agent: `shouldBlockCommand()` guards MQTT command execution
- Legacy agents without `instanceId` are treated as `instanceId="legacy"` with a warning log
- Environment variables:
  - `AGENT_LEASE_TTL_SECONDS` (backend, default: 90)
  - `AGENT_LEASE_LOCAL_TTL_MS` (agent, default: 90000)

## 6) Agent ↔ tenant binding

- Agents become tenant-bound via server-side provisioning (install token / activation code).
- Tenant binding is stored in `agents/{agentId}`.
- Agent requests can be rejected if they attempt to act under a different tenant than their stored binding.

## 7) Agent device association (binding)

Device records are stored under:

- `tenants/{tenantId}/devices/{deviceId}`

Current binding mechanism (pre-Phase B):

- When inventory upsert is enabled, device records created/updated from agent inventory include:
  - `device.agentId = <reporting agentId>`
- This is **last-writer-wins** and can cause ownership churn in multi-agent environments.

### Phase B: Device Ownership Lock (Deterministic Ownership Guarantee)

**Guarantee**: Once a device is owned by an agent, ownership does not change unless:
1. The owning agent is deleted/decommissioned
2. An admin explicitly transfers ownership
3. The device is deleted and re-discovered

**Mechanism**:

- New field: `ownerAgentId` (immutable after first set, except by admin)
- New field: `ownerLockedAt` (timestamp when ownership was locked)

**Inventory upsert behavior**:

| Condition | Behavior |
|-----------|----------|
| Device does not exist | Create with `ownerAgentId = reporting agentId` |
| Device exists, `ownerAgentId == reporting agentId` | Update normally |
| Device exists, `ownerAgentId != reporting agentId` | **Do not change ownership**; log warning |

**Routing dependency**:

- Device actions are routed using `device.ownerAgentId`.
- If `ownerAgentId` is missing (legacy devices), fall back to `device.agentId`.
- If owning agent is offline, device actions fail until agent returns or admin transfers ownership.

**Admin ownership transfer**:

- Endpoint: `POST /api/v2/admin/devices/<device_id>/transfer`
- Request: `{ "newOwnerAgentId": "agent-xxx", "reason": "optional reason" }`
- Auth: Admin/superadmin only
- Behavior: Sets `ownerAgentId`, updates `agentId` for legacy compatibility, logs audit event
- Cross-tenant transfers are blocked (409 CONFLICT)

**Implementation details** (Phase B):

- Backend: `handlers/v2/agent_api.py` → `upsert_devices_from_inventory()` enforces ownership lock
- Backend: `handlers/v2/agent_admin_handlers.py` → `transfer_device_ownership()` for admin transfers
- Backend: `utils/device_utils.py` → routing prefers `ownerAgentId` with fallback to `agentId`
- Ownership conflict events are logged with `SECURITY_EVENT_TYPES.AGENT_AUTHORIZATION`

**Ownership release on agent decommission**:

- When an agent is deleted via admin API, backend clears `ownerAgentId` on all devices owned by that agent.
- Next inventory report from any agent can claim those devices.

## 8) Phase C: Segment-Based Authority

**Core principle**: Segments are the authority, agents are workers.

### Segment Model

Segments represent logical groupings of devices within a tenant/site:

```
segmentId = tenantId/siteId/segmentKey
```

**Segment record**:

| Field | Type | Description |
|-------|------|-------------|
| `segmentId` | string | Globally unique identifier |
| `tenantId` | string | Tenant identifier |
| `siteId` | string | Site identifier |
| `segmentKey` | string | Segment key within site |
| `primaryAgentId` | string | The active agent for this segment |
| `allowedAgentIds` | array | Agents allowed to serve this segment |
| `runtimeClassRequired` | string | Required runtime class (e.g., "always_on") |

### Routing Rule

Device commands are routed as:

```
device → device.segmentId → segment.primaryAgentId → agent
```

**Routing priority**:
1. If device has `segmentId` → resolve `segment.primaryAgentId`
2. If no `segmentId` → fallback to `ownerAgentId` (Phase B legacy)
3. If no `ownerAgentId` → fallback to `agentId` (Phase A legacy)

### Admin Recovery

When a primary agent goes down:
1. Commands fail deterministically (no auto-failover)
2. Admin reassigns segment via: `POST /api/v2/admin/segments/<segment_id>/assign-agent`
3. All devices in segment immediately follow new primary agent

**No per-device reassignment required** - segment-level reassignment covers all devices.

### Implementation Details (Phase C)

- Backend: `services/segment_service.py` → segment model and routing
- Backend: `handlers/v2/segment_admin_handlers.py` → admin endpoints
- Backend: `utils/device_utils.py` → segment-based routing with fallback
- Backend: `handlers/paging_admin.py` → paging zone segment resolution

### Failure Semantics (Phase C without C.1)

| Scenario | Behavior |
|----------|----------|
| No `primaryAgentId` | Commands fail with explicit error |
| Primary agent offline | Commands fail (no auto-failover) |
| Segment not found | Fallback to legacy routing |

## 8.1) Phase C.1: Automatic Segment Failover

**Problem solved**: Manual segment reassignment does not scale. Tenants cannot monitor hundreds of agents.

**Solution**: Backend-authoritative automatic failover at the segment level using ordered standby agents.

### Segment Failover Fields (additive)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `autoFailoverEnabled` | bool | true | Enable automatic failover |
| `standbyAgentIds` | array | [] | Ordered list of standby agents |
| `failoverCooldownSeconds` | int | 300 | Minimum seconds between failovers |
| `lastFailoverAt` | timestamp | null | Last failover timestamp |
| `lastFailoverFrom` | string | null | Previous primary agent ID |

### Agent Health Definition (backend-authoritative)

An agent is **healthy** if:
1. Agent has valid lease (`leaseExpiresAt > now`), OR
2. Agent has recent heartbeat (within `AGENT_LEASE_TTL_SECONDS`, default 90s)

An agent is **unhealthy** otherwise.

### Failover Algorithm

On command routing:

```
1. If primary healthy → route to primary (no failover)
2. If primary unhealthy AND autoFailoverEnabled:
   a. Find first healthy agent in standbyAgentIds (ordered)
   b. Atomically update segment.primaryAgentId to chosen standby
   c. Set lastFailoverAt = now, lastFailoverFrom = previous primary
   d. Emit audit event: SEGMENT_FAILOVER
   e. Route to new primary
3. If no healthy standby exists → fail with SEGMENT_NO_HEALTHY_AGENT
```

### Cooldown Rules

- Failover cannot occur more than once per `failoverCooldownSeconds`
- Exception: If primary is unhealthy and a healthy standby exists, failover proceeds regardless of cooldown (availability > flap prevention)

### Admin Endpoints (Phase C.1)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v2/admin/segments/<id>/standbys` | POST | Set ordered standby agent list |
| `/api/v2/admin/segments/<id>/auto-failover` | POST | Enable/disable failover, set cooldown |
| `/api/v2/admin/segments/<id>/health` | GET | Get health status of segment agents |

### Audit Logging

All failover events are logged to:
1. Security event log (`SEGMENT_FAILOVER` event type)
2. Dedicated `segmentFailoverAudit` Firestore collection

Audit record includes:
- `segmentId`, `tenantId`
- `fromAgentId`, `toAgentId`
- `trigger`: "auto" or "manual"
- `reason`: e.g., "primary_unhealthy"
- `timestamp`

### Failure Semantics (Phase C.1)

| Scenario | Behavior |
|----------|----------|
| Primary healthy | Route to primary (no change) |
| Primary unhealthy + healthy standby | Automatic promotion |
| Primary unhealthy + no healthy standby | Fail with `SEGMENT_NO_HEALTHY_AGENT` |
| Auto-failover disabled | Fail with `PRIMARY_AGENT_UNHEALTHY` |
| In cooldown + healthy standby available | Proceed with failover (availability priority) |

### What is NOT supported (explicit)

- **No load balancing**: Failover is not load distribution
- **No agent-to-agent communication**: Backend-only orchestration
- **No broadcast/fanout**: Commands go to exactly one agent
- **No health-based "best agent" selection**: Only ordered standby list

## 9) Multi-agent semantics (current)

### Supported

- Multiple agents per tenant are possible.
- Admins can target specific agents for some actions.
- **Phase C**: Segments define which agent serves which devices.

### Explicit routing (with automatic failover in C.1)

- **RTP paging (Phase 2/C/C.1)**
  - Backend resolves agent via `zone.segmentId → segment.primaryAgentId`.
  - **Phase C.1**: If primary unhealthy, automatically promotes healthy standby.
  - Fallback to `PAGING_DEFAULT_AGENT_ID` if no segment.

- **Device actions**
  - Backend routes via `device.segmentId → segment.primaryAgentId`.
  - **Phase C.1**: If primary unhealthy, automatically promotes healthy standby.
  - Fallback to `ownerAgentId` or `agentId` for legacy devices.

### Guarantees (Phase C.1)

- **Automatic failover**: If primary agent is unhealthy, system automatically promotes a healthy standby.
- **Deterministic ordering**: Standby agents are promoted in configured order.
- **Auditable**: All failover events are logged with full context.
- ~~Deterministic device-to-agent ownership in multi-agent topologies is not guaranteed unless the deployment enforces it operationally.~~ **Phase B/C/C.1**: Deterministic ownership and automatic failover are now guaranteed via segments.

## 9) Bundled vs standalone agents

- **Standalone (recommended for production)**
  - Runs as an OS service.
  - Stable uptime and restart guarantees.

- **Bundled / supervised**
  - A UI process can supervise/spawn the agent.
  - The agent can exit when the supervising parent process exits (to avoid orphan processes).

## 10) Lifecycle and upgrades

- Agent upgrades can occur by replacing the deployed agent package.
- Version drift across agents is possible.

Compatibility constraint:

- If backend expects a feature an agent does not have (or vice versa), behavior is best-effort and may fail at runtime.

## 11) Failure modes (deterministic vs best-effort)

- **Agent restart mid-page**: RTP stream stops (agent owns RTP emission).
- **MQTT loss (Phase 2)**:
  - New paging sessions cannot be started.
  - Active sessions continue once browser is connected to `wsUrl` (media-plane is direct WS).
- **Duplicate `agentId`** (pre-Phase B):
  - Non-deterministic: multiple agents may execute the same command.
- **Duplicate `agentId`** (Phase B):
  - Second agent is rejected with 409 CONFLICT and exits immediately.
  - Only one agent instance can be active per `agentId`.
- **Partial connectivity**:
  - Agent may be online to MQTT but unable to reach devices; actions can fail per-device.

## 12) Operator guidance (deployment)

- Prefer one agent per site/segment for predictable ownership.
- Avoid cloning `.env` files or storage volumes containing `AGENT_ID`.
- For server/NAS/VM deployments, install the agent as a service and persist identity.
