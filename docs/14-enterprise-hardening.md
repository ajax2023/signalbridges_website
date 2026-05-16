# Enterprise Hardening — SIP Paging Audit & Offline Paging Security

This document covers production hardening features for SIP paging audit logging and offline paging authentication/auditability.

## 1. Agent Activation UX

### Activation Flows

| Flow | Description | Production Recommended |
|------|-------------|------------------------|
| **Install Token** | Admin generates a one-time install token from the web UI. Agent uses token during first-run activation. | **Yes (Primary)** |
| **Activation Code** | Admin provides a short activation code. Agent prompts for code during setup. | Secondary |
| **Pre-configured** | Agent is deployed with `AGENT_ID` and credentials pre-set (e.g., via MDM or image). | Enterprise/MSP only |

### Preferred Production Flow: Install Token

1. Admin navigates to **Agents → Add Agent** in the web UI.
2. Admin generates an install token (valid for 24 hours by default).
3. Admin provides the token to the site technician.
4. Technician runs the agent installer and enters the token when prompted.
5. Agent registers with the backend, receives its `agentId`, and persists credentials.
6. Token is consumed (single-use).

**Security properties:**
- Token is single-use and time-limited.
- Token is tenant-scoped; agent inherits tenant binding.
- No long-lived credentials are transmitted out-of-band.

### Secondary Flow: Activation Code

Used when install tokens are impractical (e.g., remote support scenarios).

1. Admin generates a short activation code (6-8 characters).
2. Technician enters the code in the agent UI.
3. Agent exchanges the code for credentials via backend API.

**Limitations:**
- Codes are shorter and may be easier to guess (rate limiting required).
- Less audit trail than install tokens.

### Pre-configured Deployment

For enterprise/MSP deployments where agents are provisioned via automation:

- Set `AGENT_ID`, `TENANT_ID`, and credentials in environment or config file.
- Agent skips activation flow and uses pre-set identity.

**Limitations:**
- Requires secure credential distribution (MDM, sealed secrets, etc.).
- Not recommended for manual deployments.

---

## 2. Paging Media-Plane Selection

### Decision Matrix

| Scenario | Media Path | Decision Made By |
|----------|------------|------------------|
| Browser supports WebRTC + agent reachable | **Direct browser → agent** | Frontend (automatic) |
| Browser cannot reach agent directly | **Browser → audio-relay → agent** | Frontend (fallback) |
| Offline mode (no cloud) | **Local UI → agent** | Operator (explicit) |

### Direct Browser → Agent (Preferred)

When the browser can establish a WebSocket connection directly to the agent's RTP server:

```
Browser (mic) → WebSocket → Agent (rtpServer.js) → RTP multicast → Algo devices
```

**Requirements:**
- Agent's RTP server port (default 8765) is reachable from the browser.
- Same LAN or VPN connectivity.

**Advantages:**
- Lowest latency.
- No cloud dependency for media.
- Works if cloud is temporarily unavailable (after session start).

### Audio-Relay Fallback

When direct connectivity is not possible (e.g., browser is remote, NAT traversal fails):

```
Browser (mic) → WebSocket → audio-relay (cloud) → WebSocket → Agent → RTP multicast
```

**Requirements:**
- `audio-relay` service deployed and reachable.
- Agent connected to audio-relay via WebSocket.

**Limitations:**
- Higher latency (cloud round-trip).
- Requires cloud connectivity for entire session.

### Fallback Behavior

1. Frontend attempts direct WebSocket to agent's `wsUrl`.
2. If connection fails within timeout (default 3s), frontend falls back to audio-relay.
3. If audio-relay also fails, paging session fails with error.

**Operator visibility:**
- UI may indicate "Direct" vs "Relay" mode (implementation-dependent).
- Errors are surfaced with actionable messages.

---

## 3. SIP Paging Operator Semantics

### SIP Paging is Cloud/Twilio Dependent

**Explicit statement:** SIP paging requires:
- Cloud backend (`algo-bridge-backend`) for authorization.
- Twilio for SIP call origination.
- Internet connectivity from the operator's browser.

**SIP paging does NOT work offline.** For offline paging, use RTP paging.

### Failure Mode → Operator Message Mapping

| Failure Mode | Error Code | Operator-Visible Message |
|--------------|------------|--------------------------|
| No internet | `network_error` | "Cannot reach server. Check your internet connection." |
| Backend unreachable | `backend_unavailable` | "Paging service unavailable. Try again later." |
| Twilio unavailable | `twilio_error` | "Voice service unavailable. Try again later." |
| SIP URI invalid | `sip_uri_invalid` | "Invalid paging zone configuration. Contact admin." |
| Zone not found | `zone_not_found` | "Paging zone not found." |
| Zone inactive | `zone_inactive` | "Paging zone is disabled." |
| User not authorized | `zone_access_denied` | "You do not have permission to page this zone." |
| Token expired | `authToken_expired` | "Session expired. Please try again." |
| Call failed (busy) | `busy` | "Line busy. Try again." |
| Call failed (no answer) | `no-answer` | "No answer from paging system." |
| Call failed (other) | `failed` | "Call failed. Error: [details]" |

### SIP Paging Audit Trail

Every SIP paging attempt is logged to:

**Collection:** `tenants/{tenantId}/sipPagingCalls/{callId}`

**Schema:**

| Field | Type | Description |
|-------|------|-------------|
| `tenantId` | string | Tenant identifier |
| `userId` | string | User who initiated the page |
| `userEmail` | string | User's email (if available) |
| `zoneId` | string | Paging zone identifier |
| `zoneName` | string | Human-readable zone name |
| `sipUri` | string | Target SIP URI |
| `callSid` | string | Twilio CallSid (set when call starts) |
| `state` | string | `authorized` → `dialing` → `in_progress` → `completed`/`failed`/`canceled` |
| `twilioErrorCode` | string | Twilio error code (if failed) |
| `failureReason` | string | Human-readable failure reason |
| `authorizedAt` | timestamp | When authorization was granted |
| `callStartedAt` | timestamp | When Twilio consumed the token |
| `callEndedAt` | timestamp | When call ended |
| `tokenId` | string | Correlation ID (jti) |

**Queryable by:**
- Tenant (collection is tenant-scoped)
- User (`userId` field)
- Zone (`zoneId` field)
- Time range (`authorizedAt`, `callEndedAt`)
- Outcome (`state` field)

### RTP Paging as Offline Alternative

When SIP paging is unavailable, operators can use RTP paging:

| Feature | SIP Paging | RTP Paging |
|---------|------------|------------|
| Cloud required | Yes | No (after cache sync) |
| Twilio required | Yes | No |
| Works offline | No | Yes |
| Audio quality | Twilio-dependent | Direct (low latency) |
| Audit logging | Cloud (Firestore) | Local (agent log file; optionally synced to Firestore when online) |

---

## 4. Offline Paging Security Posture

### Default: LAN-Trust Model

By default, offline paging endpoints are **unauthenticated**:

- `GET /offline-paging` (UI)
- `GET /api/offline/paging/zones`
- `GET /api/offline/paging/zone/:id`
- `GET /api/offline/paging/status`
- `WS /ws/live-audio`

**Rationale:** Offline mode is designed for LAN-only access when cloud is unavailable. LAN access implies physical/network trust.

**Risk:** Anyone on the LAN can initiate paging.

### Optional: PIN/Password Protection

For environments requiring local authentication:

**Agent configuration:**

```bash
# In agent environment or .env file
OFFLINE_PAGING_AUTH_MODE=pin    # Options: none, pin, password
OFFLINE_PAGING_SECRET=1234      # The PIN or password
```

**Behavior when enabled:**
- All offline paging endpoints require authentication.
- UI presents a login form.
- API requests require `?secret=<value>` or `Authorization: Bearer <value>`.
- Sessions are tracked in-memory; session ID can be reused for subsequent requests.

**Auth modes:**

| Mode | Description |
|------|-------------|
| `none` | No authentication (default, LAN-trust) |
| `pin` | Numeric PIN (e.g., 4-6 digits) |
| `password` | Alphanumeric password |

### Offline Audit Logging

All offline paging actions are logged locally to:

**File:** `<agent-data-dir>/logs/offline-audit.log`

**Format:** JSON lines (one JSON object per line)

**Event types:**

| Event Type | Description |
|------------|-------------|
| `auth_denied` | Authentication failed |
| `zones_listed` | Operator listed available zones |
| `zone_resolved` | Operator resolved a zone's paging params |
| `ui_accessed` | Operator accessed the offline paging UI |
| `ws_auth_denied` | WebSocket auth failed |
| `paging_started` | Paging session started |
| `paging_ended` | Paging session ended |

**Example log entry:**

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "event": "offline_paging",
  "eventType": "paging_started",
  "agentId": "agent-site-001",
  "operator": "pin:1234***",
  "zoneId": "zone-main-building",
  "multicastGroup": "239.255.0.1",
  "port": "5004",
  "commandId": "offline-1705315800000"
}
```

### Audit Limitations

| Limitation | Description |
|------------|-------------|
| Local-first, best-effort sync | Logs are written to the agent first; when online, the agent can sync to Firestore if enabled |
| No tamper protection | Logs can be modified by anyone with file system access |
| No real-time alerting | No cloud notification of offline paging events |
| Session-based identity | Operator identity is session-scoped, not user-scoped |

### Cloud Sync of Offline Paging Audit (Implemented, feature-flagged)

Offline paging audit logs are still written locally (append-only JSON lines) to:

**File:** `<agent-data-dir>/logs/offline-audit.log`

When cloud connectivity returns, the agent can best-effort sync those events to Firestore via the backend ingest endpoint:

- **Backend endpoint**: `POST /api/v2/agents/offline-paging-audit/sync`
- **Auth**: agent JWT (agent identity; not user RBAC)
- **Idempotency**: backend recomputes `eventId = sha256(agentId|logFileId|byteOffset)` and rejects mismatches
- **Firestore collection**: `tenants/{tenantId}/offlinePagingAuditEvents/{eventId}`
- **Semantics**: retry-safe, crash-safe; cursor advances only after backend ack

**Default behavior**: sync is disabled unless explicitly enabled:

```bash
OFFLINE_AUDIT_SYNC_ENABLED=false  # default
```

Enabling sync does not block offline paging. Offline paging continues to function even if sync fails.

---

## 5. Summary: Enterprise Readiness

### SIP Paging

| Requirement | Status |
|-------------|--------|
| Tenant-scoped audit logs | ✅ Implemented |
| User attribution | ✅ Implemented |
| CallSid correlation | ✅ Implemented |
| Outcome tracking | ✅ Implemented |
| Queryable by tenant/user/zone/time | ✅ Implemented |
| No phone-number-based tenant inference | ✅ Implemented |

**Enterprise acceptable:** Yes, with cloud connectivity.

### Offline Paging

| Requirement | Status |
|-------------|--------|
| LAN-trust default | ✅ Implemented |
| Optional PIN/password auth | ✅ Implemented |
| Structured local audit logs | ✅ Implemented |
| Operator attribution | ✅ Implemented (session-based) |
| Cloud sync of audit logs | ✅ Implemented (feature-flagged; default off) |

**Enterprise acceptable:** Yes, under the following constraints:
- LAN access is controlled (physical security, network segmentation).
- For higher assurance, enable PIN/password auth.
- If centralized audit logging is required, enable offline audit sync and/or collect local logs via external log collection.
- Offline paging audit logs are authored locally first; cloud audit is post-sync and best-effort.
