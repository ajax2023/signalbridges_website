# CanAlerts / Algo Bridge — Overview

## What this system is

CanAlerts / Algo Bridge is a multi-component system for:

- Managing **tenants**, **users**, and **devices** (Algo IP devices) in a cloud control plane.
- Executing **actions** (e.g., device REST operations, paging, image display, Twilio voice/SIP) from a web UI.
- Using an **edge agent** on the customer network to reach devices that are not reachable directly from the cloud.

This repository contains multiple deployable services (cloud + edge) that together provide:

- A web admin/operator interface (`Canalerts`).
- A cloud backend API + control plane (`algo-bridge-backend`).
- An edge agent that runs on customer networks (`algo-network-agent`).
- Cloud WebSocket relays for paging control and (optionally) live audio (`algo-bridge-relay`, `audio-relay`).

## Who uses it

- **Operators / end users** (school staff, safety operators, etc.)
  - Trigger actions like paging.
  - Trigger image display actions (8410/8420 screen).

- **Tenant admins**
  - Manage tenant configuration.
  - Manage devices, paging zones, and action definitions.
  - Create agent install tokens and/or manage agent records.

- **Platform admins / superadmins**
  - Cross-tenant visibility and management (where implemented).
  - Support and diagnostics.

## User Home Screen and Action Model

The primary operator experience is a **user workspace** (often shown as an “SB” icon in diagrams). A user workspace is:

- An Electron desktop shell that loads the SignalBridge/Canalerts React application.
- A home screen / command launcher that presents **tiles/buttons**.

Each tile/button is a user-facing entry point into an execution path:

- RTP paging
- SIP paging
- Algo device actions (image display, strobe, etc.)
- Notifications (SMS, email, calls)

Important mental model:

- Tiles/buttons are **not separate apps**. They are different actions executed by the same platform.
- Similar-looking buttons can have different runtime guarantees because they depend on different components.

Security principal and authorization boundary:

- The security principal for online actions is the **authenticated user** (Firebase Auth), scoped by `tenantId` and role/claims.
- The backend (`algo-bridge-backend`) is the authorization boundary; it validates user identity and permissions before dispatching actions.
- Hiding or showing a tile/button in the UI is not a security boundary; backend authorization still applies.

Home screen composition:

- The home screen layout is user-specific and can be customized; the set of visible tiles/buttons may vary by user.
- Administrative editing controls may be role-gated, but runtime authorization is enforced by backend APIs.

Availability semantics (user POV):

- Not all tiles/buttons have identical availability guarantees.
- The UI may present multiple paging options side-by-side even though:
  - RTP paging can operate in an offline LAN-only mode via the agent.
  - SIP paging is cloud- and Twilio-dependent.
- The launcher may not dynamically disable/hide actions based on real-time Internet/Twilio/agent availability; in many cases the operator learns availability at run time (action start fails with a clear error).

## What it is NOT

- **Not a LAN-only solution**
  - Cloud services exist and are required for the normal control plane.

- **Not a single “all-in-one” service**
  - Control plane, paging signaling, audio relay, and the edge agent are separate components.

- **Not a PBX product**
  - SIP is treated as a transport used by Twilio + backend routing policies.
  - This system does not aim to provide PBX features (transfer, voicemail, hunt groups).

- **Not a generic device web-proxy** (canonical path)
  - A legacy tunnel/proxy exists (`algo-bridge-relay/relayServer.js`), but the architecture direction is config-sync (snapshots + deltas) rather than live proxying.

## Repository structure (authoritative)

- `algo-network-agent` (Edge)
  - Electron app + headless Node host.
  - Talks to Algo devices on the customer LAN.

- `Canalerts` (Cloud)
  - Web frontend.

- `algo-bridge-backend` (Cloud)
  - Cloud control plane / REST API.

- `algo-bridge-relay` (Cloud)
  - Paging Bridge (control-plane WS) + legacy tunnel proxy.

- `audio-relay` (Cloud)
  - Optional audio relay for live paging media frames.

- `OLD-*`
  - Legacy folders. Must not be extended.

## Key terms

- **Agent**: A customer-network process that can reach Algo devices (HTTP/HTTPS, multicast) and can accept control from the backend.
- **Paging Bridge**: Cloud WebSocket service used for paging session signaling (not media).
- **Audio relay**: Cloud WebSocket service that can relay live audio frames between browser and agent when direct browser→agent networking is not feasible.

## Security & Resilience Capabilities (current behavior)

This section summarizes capabilities that are already present in the codebase. It does not describe future intent.

### Offline / degraded-network operation

- **CONFIRMED**: The agent can execute LAN operations (device REST, RTP multicast) without the cloud *once invoked*.
- **CONFIRMED**: The agent exposes local endpoints that can be used without cloud connectivity:
  - WebSocket `/ws/live-audio` (audio ingest)
  - HTTP `POST /api/local/command` supporting `start_rtp_paging` and `stop_rtp_paging`
- **CONFIRMED**: Paging Bridge and agent clients implement reconnect/backoff behavior for intermittent connectivity.
- **CONSTRAINT / FAILURE MODES**:
  - Cloud-initiated actions (UI → backend → agent) require backend + MQTT/WS connectivity.
  - Offline invocation mechanism for local endpoints is **UNKNOWN** (who calls them when cloud is unavailable).

### Role-based authorization and scoped permissions

- **CONFIRMED**: Backend enforces authentication and role-based access control (Firebase auth + role gating).
- **CONFIRMED**: Tenant scoping is enforced in several endpoints; non-admin users are blocked from cross-tenant reads/writes.
- **CONFIRMED**: Paging includes additional scoped permissions:
  - Tenant paging “role policies” (e.g., `canPage`) stored per tenant.
  - Zone allowlists via `allowedRoles` and `allowedUserIds` for SIP paging zones.
- **CONSTRAINT / FAILURE MODES**:
  - RBAC/tenant enforcement is not uniformly documented for all endpoints; some behaviors remain endpoint-specific.

### Audit-grade event logging and traceability

- **CONFIRMED**: Backend includes an events API writing to `tenants/{tenantId}/events` with `triggeredBy` and timestamps.
- **CONFIRMED**: Backend produces structured security/auth/RBAC logs to application logging.
- **CONFIRMED**: Agent writes a local `offline-audit.log` for certain locally-invoked commands.
- **IMPLIED**: Cloud Run / Firebase infrastructure may provide additional log retention/search (not described here).
- **CONSTRAINT / FAILURE MODES**:
  - Whether all “actions” (paging/image display/etc.) are recorded to the Firestore events collection is **UNKNOWN**.
  - Security event logging is currently log-based; persistence to a security monitoring system is **UNKNOWN**.

### Multi-agent redundancy / partial failover behavior

- **CONFIRMED**: Paging Bridge supports multiple simultaneous agent connections and selects an agent for a request:
  - Prefers explicit `target`
  - Else uses `PAGING_DEFAULT_AGENT_ID` if connected
  - Else falls back to the first connected agent
- **CONSTRAINT / FAILURE MODES**:
  - Selection is not health/latency aware; it is a simple connectivity-based choice.
  - If Paging Bridge scales to multiple instances, backend and agent may land on different instances and appear “not connected”.

### Zone-based or target-scoped alerting

- **CONFIRMED**: Paging requests are zone-based (backend accepts `zoneId` and resolves zone targets / multicast groups).
- **CONFIRMED**: Paging requests can be target-scoped (Paging Bridge uses `target` selection).
- **CONFIRMED**: SIP paging zones support allowlisting by role and/or user ID.
- **CONSTRAINT / FAILURE MODES**:
  - Some zone/device binding and policy details depend on tenant configuration stored in Firestore.

## UNKNOWN

- Which customer deployments use:
  - Direct browser→agent WebSocket audio vs audio-relay as the *preferred* path (both are supported).
  - Legacy tunnel proxy vs config-sync as the primary device-management UX.
