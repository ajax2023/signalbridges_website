# Known Assumptions

This document lists explicit assumptions implied by the current implementation.

## Network topology

- **NAT and firewalls are common**
  - Agents primarily make outbound connections to cloud services.

- **VLAN segmentation is common**
  - Paging zones use multicast groups/ports; multicast routing across VLANs may require network configuration.

- **Direct browser → agent connectivity is not guaranteed**
  - The system includes an `audio-relay` component specifically to avoid relying on direct routing in all environments.

## Cloud access

- Cloud control plane services exist and are expected to be reachable:
  - `algo-bridge-backend` (HTTPS)
  - MQTT broker (WSS/TLS) — **required for paging control-plane (Phase 2)**
  - ~~Paging Bridge (WSS)~~ — **DEPRECATED for paging (Phase 2)**; MQTT replaces this
  - Audio relay (WSS) if enabled (media-plane only, not control-plane)
  - GCS bucket used for image display uploads/downloads (HTTPS via signed URLs)

## UX / operator experience assumptions

- **Not all user-visible actions have identical availability guarantees**
  - The launcher UI can present multiple actions side-by-side (e.g., RTP paging and SIP paging) even though they depend on different components.
  - Operators should not assume “all buttons work offline”; availability depends on whether the action requires cloud services, Twilio, or an on-prem agent.

## SIP paging assumptions

- **Cloud-dependent**
  - SIP paging requires `algo-bridge-backend` and Twilio to be reachable.
  - If backend or Twilio is unreachable, SIP paging cannot be started.

- **Twilio-dependent**
  - SIP paging requires Twilio Voice (WebRTC) and Twilio webhook delivery to backend TwiML endpoints.
  - Twilio configuration (Voice App / Voice URL) is assumed correct for production.

- **No offline or degraded mode**
  - SIP paging does not run via the agent and does not have an offline fallback.
  - “Offline paging” refers to RTP paging via the agent only.

- **Signature validation is assumed enabled in production**
  - Twilio webhook signature validation is expected to be enabled (default behavior).
  - If proxy headers/host/proto mismatch causes signature validation failures, SIP paging may become unavailable.

- **Twilio webhook endpoints are protected by signature validation, not IP-based rate limiting**
  - Twilio webhook endpoints used by SIP paging are exempt from generic IP-based limiters when `X-Twilio-Signature` is valid.
  - This prevents Twilio webhook retrieval failures due to shared Twilio egress IPs.

## Security boundaries

- The backend is the **tenant scoping and authorization** boundary.
  - Agent is not expected to enforce tenant authorization beyond using its assigned identity.

## Agent assumptions and constraints

### Identity persistence

- **Assumption**: Each production agent has a stable, persisted identity (`agentId`).
- **Implication**: Headless deployments should use a persistent storage path (e.g., `HEADLESS_STORAGE_PATH`) so the assigned identity and tokens survive restarts.

### Duplicate agent identity is hazardous (pre-Phase B)

- **Assumption**: A single `agentId` is not cloned across machines.
- **Implication**: If two processes run with the same `AGENT_ID`, both may receive and execute commands on the same MQTT topic (`agent/{agentId}/command`). Outcomes are non-deterministic and can result in duplicate actions.

### Phase B: Single-Active-Agent Guarantee (Agent Lease)

- **Guarantee**: At most one agent instance can be active per `agentId` at any time.
- **Mechanism**: Backend enforces a heartbeat-based lease. If a second agent attempts to heartbeat with the same `agentId`, it receives 409 CONFLICT and must exit immediately.
- **Lease TTL**: 90 seconds (configurable via `AGENT_LEASE_TTL_SECONDS`).
- **Implication**: Duplicate agent execution is eliminated. Operators see a clear failure if cloning occurs.

### Tenant binding

- **Assumption**: Agents are tenant-bound by server-side flows (install token registration, activation code), not by self-asserted configuration.
- **Implication**: Operators should treat `AGENT_TENANT` as a configuration convenience; tenant authorization is still enforced by backend based on stored agent binding and token claims.

### Multi-agent routing is explicit

- **Assumption**: The backend chooses a specific target agent for actions.
- **Implication**:
  - RTP paging (Phase 2) targets a specific agent ID (commonly `PAGING_DEFAULT_AGENT_ID`).
  - Device actions route based on `device.ownerAgentId` (Phase B) or `device.agentId` (legacy fallback) stored in Firestore.
  - There is no guaranteed automatic failover across agents unless the device record or target selection is updated.

### Phase B: Deterministic Device Ownership

- **Guarantee**: Once a device is owned by an agent, ownership does not change unless:
  1. The owning agent is deleted/decommissioned
  2. An admin explicitly transfers ownership
  3. The device is deleted and re-discovered
- **Mechanism**: New field `ownerAgentId` is immutable after first set (except by admin transfer).
- **Implication**: Device ownership churn in multi-agent environments is eliminated. First agent to discover a device owns it.

### Phase C: Segment-Based Authority

- **Guarantee**: Device routing is determined by segment assignment, not per-device agent binding.
- **Mechanism**: Devices are assigned to segments; segments have a `primaryAgentId`. Routing resolves `device.segmentId → segment.primaryAgentId`.
- **Implication**:
  - Admin recovery is at segment level, not per-device.
  - ~~When primary agent goes down, admin reassigns segment (one operation covers all devices).~~
  - ~~No automatic failover - failures are deterministic.~~
  - **Phase C.1**: Automatic failover is now supported (see below).

### Phase C.1: Automatic Segment Failover

- **Guarantee**: If primary agent is unhealthy, system automatically promotes a healthy standby agent.
- **Mechanism**:
  - Backend checks agent health via lease/heartbeat timestamps
  - If primary unhealthy and `autoFailoverEnabled=true`, first healthy standby is promoted
  - Failover is atomic (Firestore transaction) and audited
- **Health definition**: Agent is healthy if `leaseExpiresAt > now` OR `last_heartbeat` within 90 seconds
- **Implication**:
  - Tenants do not need to monitor individual agents
  - Failover is deterministic (ordered standby list, not "best agent" selection)
  - Cooldown prevents flapping (default 300 seconds)
  - All failover events are logged to `segmentFailoverAudit` collection

### What is NOT supported (explicit)

- ~~**No automatic failover**: If primary agent is offline, commands fail. Admin must manually reassign.~~ **RESOLVED (Phase C.1)**: Automatic failover is now supported via ordered standby list.
- **No clustering/HA**: Agents do not coordinate with each other. Failover is backend-orchestrated.
- **No agent gossip/discovery**: Agents are unaware of other agents.
- **No load balancing**: Failover is not load distribution; only one agent serves a segment at a time.
- **No health-based "best agent" selection**: Only ordered standby list is used for failover.

- ~~Paging Bridge stores state **in-memory per instance**.~~
  - ~~This implies operational constraints (single-instance or sticky routing) to avoid agent/backend splits.~~
  - **RESOLVED (Phase 2)**: Paging control-plane now uses MQTT. No single-instance constraint for paging.

- Device access credentials
  - Credentials can be included in action payloads (e.g., `image_display` includes `auth` in payload).
  - **UNKNOWN**: Whether credentials are stored long-term, where, and under which encryption/secret-management policy.

- Signed URLs for image display
  - Backend mints short-lived signed URLs for a specific object path under `image-display/<tenantId>/...`.
  - Anyone holding the URL can perform the corresponding operation (`PUT` upload or `GET` download) until expiry.

- TLS and self-signed certificates
  - Agent code contains TLS TOFU (Trust On First Use) support for private-IP HTTPS devices (see `TLS_TOFU` behavior in agent rest handler).

## Implemented capabilities (assumption implications)

### Authorization boundary

- **CONFIRMED**: The backend is the enforcement point for user authentication and role checks.
- **IMPLIED**: ~~Paging Bridge and~~ audio-relay operate as transport/relay services and are not where tenant authorization decisions are expected to occur.
- **Phase 2**: MQTT broker is a transport layer; authorization is enforced at backend before publishing commands.

### Traceability boundary

- **CONFIRMED**: Backend produces structured logs for auth/RBAC and some security events.
- **CONFIRMED**: Agent can write `offline-audit.log` for certain locally-invoked actions.
- **Phase C.2**: SIP paging now has audit-grade logging in `tenants/{tenantId}/sipPagingCalls/{callId}` with full lifecycle tracking.
- **Phase C.2**: Offline paging now has structured JSON audit logging with operator attribution.
- **RESOLVED**: SIP paging audit trail is now complete and queryable per tenant.
- **CONFIRMED**: Offline paging audit is local-first (agent log file) and can be synced to Firestore when online (feature-flagged; default off).

### Degraded operation boundary

- **CONFIRMED**: The agent hosts local endpoints that can be invoked without cloud connectivity.
- **CONFIRMED**: Offline paging is supported via the agent's local web UI at `/offline-paging` and local REST API.

## Offline Paging Assumptions

### Trust model

- **LAN-only trust (default)**: Offline paging endpoints do not require authentication by default.
- **Phase C.2**: Optional PIN/password authentication can be enabled via `OFFLINE_PAGING_AUTH_MODE` and `OFFLINE_PAGING_SECRET` environment variables.
- **Assumption**: SIP paging is cloud-dependent and explicitly not supported in offline mode.
- **Assumption**: Any device/user with LAN access to the agent host is trusted to initiate paging (unless auth is enabled).
- **Implication**: Network segmentation and firewall rules are the primary access control mechanism in offline mode.
- **See also**: `docs/14-enterprise-hardening.md` for detailed offline paging security posture.

### Cache validity

- **Assumption**: Paging zone configuration is relatively stable and does not change frequently.
- **Implication**: Operators accept that offline paging uses cached zone data that may be up to 5 minutes stale (or older if agent has been offline).

### Operator knowledge

- **Assumption**: Operators using offline paging know the agent's IP address or hostname on the LAN.
- **Assumption**: Operators understand that offline paging bypasses cloud-side RBAC; audit logs are written locally first and cloud sync (if enabled) uses agent identity (not user RBAC).

### Network requirements

- **Assumption**: Operator's browser can reach the agent on port 3000 (or configured `PORT`).
- **Assumption**: Multicast traffic from the agent can reach target speakers on the LAN.
- **Assumption**: Browser has microphone access (HTTPS not required for localhost/LAN in most browsers).

### Audit and compliance

- **CONFIRMED**: Offline paging commands are logged to local `offline-audit.log` when available.
- **CONFIRMED**: When `OFFLINE_AUDIT_SYNC_ENABLED=true`, the agent can sync offline paging audit events to Firestore after connectivity returns.
- **Firestore collection**: `tenants/{tenantId}/offlinePagingAuditEvents/{eventId}`
- **Implication**: If sync is disabled, offline paging audit logs must be collected from the agent host separately.

## Online Paging Assumptions (Phase 2)

### MQTT broker availability

- **Assumption**: MQTT broker (EMQX) is available and reachable for paging session start.
- **Implication**: If MQTT is down, new paging sessions cannot be started (HTTP 503).
- **Implication**: Active paging sessions are NOT affected by MQTT outages (media-plane is decoupled).

### Control-plane / media-plane decoupling

- **Assumption**: Control-plane (MQTT) is only used for session start/stop signaling.
- **Assumption**: Media-plane (WebSocket) operates independently once session is established.
- **Implication**: Backend or MQTT restarts do not interrupt active paging sessions.
- **Implication**: Agent restart terminates the active session (agent owns RTP stream).

### Agent selection

- **Assumption**: Backend knows which agent to target for a paging session.
- **Assumption**: Backend publishes directly to `agent/{agentId}/command` topic.
- **Implication**: No "first connected agent" fallback at the relay level; backend must specify target.

### Timeout behavior

- **Assumption**: Backend waits up to 15 seconds for agent reply.
- **Implication**: If agent is offline or slow, browser receives HTTP 504 after 15s.
- **Implication**: Agent should respond within 2 seconds under normal conditions.

## UNKNOWN

- Which Algo device models and firmware versions are officially supported for each feature.
- Exact firewall port requirements for direct browser→agent mode.
- Whether the platform expects multicast paging to work across VLANs by default vs requiring L3 multicast routing configuration.
