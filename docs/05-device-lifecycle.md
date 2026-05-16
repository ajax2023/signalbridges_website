# Device Lifecycle

This document defines device states as they exist (or are implied) in the current system.

## Device entities

Two main “device-like” entities exist:

- **Algo devices** (physical IP devices on customer LAN)
  - Stored under `tenants/{tenantId}/devices`.

- **Agents** (edge software that can reach the LAN)
  - Stored under `agents/{agentId}`.

This document focuses on Algo devices.

## Device state model (Algo devices)

The codebase does not define a single canonical enum for device lifecycle state. The following states are derived from observed fields and behavior.

| State | Meaning in this system | Where stored | Controller |
|---|---|---|---|
| `unknown` | Device exists in concept but has not been discovered or has insufficient metadata (IP/MAC). | Firestore `tenants/{tenantId}/devices` | Backend creates/updates; agent inventory may update |
| `inventory` | Device record exists based on agent-reported inventory or admin entry. | Firestore | Agent reports inventory; backend upserts |
| `active` | Device is considered usable and appears in UI for actions. | Firestore | Backend/UI |
| `offline` | Device is not reachable from the agent (implied). | UNKNOWN | UNKNOWN |

## “Activation” meaning

The term “activation” is used for agents in the backend API.

### Agent activation mechanisms (confirmed)

- **Install token registration**
  - `POST /api/v2/admin/agents/install-tokens` (create token)
  - `POST /api/v2/agents/register/install` (agent consumes token)

- **Activation code flow**
  - Endpoint exists: `POST /api/v2/agents/activate`
  - Details of how the activation code is minted/entered in the UI are **UNKNOWN** in this documentation set.

## State transitions (control)

### Device discovery / inventory update

- **Initiator**: Agent
- **Controller**: Backend
- **Mechanism**: Agent posts inventory to backend; backend upserts `tenants/{tenantId}/devices`.

#### Device-to-agent association (pre-Phase B behavior)

- Device records include an `agentId` field.
- When the backend upserts a device from agent inventory, it sets `device.agentId = <reporting agentId>`.
- Device actions are routed to the agent referenced by the device record.
- This is **last-writer-wins** and can cause ownership churn in multi-agent environments.

#### Device-to-agent association (Phase B: Ownership Lock)

**Guarantee**: Once a device is owned by an agent, ownership does not change unless:
1. The owning agent is deleted/decommissioned
2. An admin explicitly transfers ownership
3. The device is deleted and re-discovered

**New fields**:
- `ownerAgentId`: The agent that owns this device (immutable after first set, except by admin)
- `ownerLockedAt`: Timestamp when ownership was locked

**Inventory upsert behavior**:
- Device does not exist → create with `ownerAgentId = reporting agentId`
- Device exists, `ownerAgentId == reporting agentId` → update normally
- Device exists, `ownerAgentId != reporting agentId` → **do not change ownership**; log warning

**Routing**:
- Device actions are routed using `device.ownerAgentId`.
- If `ownerAgentId` is missing (legacy devices), fall back to `device.agentId`.

**Admin ownership transfer**:
- Endpoint: `POST /api/v2/admin/devices/<device_id>/transfer`
- Request: `{ "newOwnerAgentId": "agent-xxx" }`
- Auth: Admin/superadmin only

Multi-agent implications (Phase B):

- First agent to report a device owns it.
- Subsequent agents cannot take ownership without admin transfer.
- If owning agent is offline, device actions fail until agent returns or admin transfers ownership.

#### Device-to-segment association (Phase C: Segment-Based Authority)

**Core change**: Device routing is now segment-based, not device-based.

**New field**:
- `segmentId`: The segment this device belongs to (format: `tenantId/siteId/segmentKey`)

**Routing rule**:
```
device → device.segmentId → segment.primaryAgentId → agent
```

**Routing priority**:
1. If device has `segmentId` → resolve `segment.primaryAgentId`
2. If no `segmentId` → fallback to `ownerAgentId` (Phase B)
3. If no `ownerAgentId` → fallback to `agentId` (legacy)

**Admin recovery**:
- When primary agent goes down, admin reassigns segment (not individual devices)
- Endpoint: `POST /api/v2/admin/segments/<segment_id>/assign-agent`
- All devices in segment immediately follow new primary agent

**Operational guidance**:
- Assign devices to segments during initial setup
- Use bulk assignment: `POST /api/v2/admin/segments/<segment_id>/devices`
- Legacy devices without `segmentId` continue to work via fallback routing

### Device action execution (example: image display)

- **Initiator**: UI user
- **Controller**: Backend (dispatch) → MQTT → Agent (LAN execution)

## Capabilities relevant to lifecycle

### Multi-agent behavior and device association

- **CONFIRMED**: Paging Bridge supports multiple connected agents and selects an agent based on connectivity and request targeting.
- **CONFIRMED**: For `image_display`, backend attempts to select an explicit `agentId` from action/context, and otherwise may derive `agentId` from the device record.
- **CONSTRAINT / FAILURE MODES**:
  - Agent selection is not health-aware; it is primarily based on "is connected" and configuration (e.g., `PAGING_DEFAULT_AGENT_ID`).
  - **Phase B**: Ownership lock guarantees deterministic binding.

## UNKNOWN

- The exact set of device `status` values used in production for Algo devices.
- Whether devices have an explicit lifecycle for "claimed/unclaimed" vs "assigned to tenant".
- **Phase B**: Ownership is locked on first discovery; no automatic reassignment.
