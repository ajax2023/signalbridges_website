# Phase 2 Paging Control-Plane Validation Checklist

This document provides a production rollout checklist for Phase 2 (MQTT-based paging control-plane).

## A) Pre-Deploy Checks

### A1. Feature Flag Default

| Check | Expected | PASS/FAIL |
|-------|----------|-----------|
| `USE_MQTT_PAGING_CONTROL_PLANE` env var default | `false` (or unset) | ☐ |
| Backend starts without errors when flag is `false` | No startup errors | ☐ |
| Backend starts without errors when flag is `true` | No startup errors | ☐ |

**Verification command:**
```bash
# Check backend logs for startup errors
grep -i "error\|exception" backend.log | head -20
```

### A2. MQTT Broker Reachability

| Check | Expected | PASS/FAIL |
|-------|----------|-----------|
| Backend can connect to MQTT broker | `[MQTT] Connected to broker` in logs | ☐ |
| Backend can subscribe to `agent/+/result` | `[MQTT_SUBSCRIBE] subscription SUCCESS` in logs | ☐ |
| Backend can publish to `agent/{id}/command` | `[MQTT_DEBUG] Command confirmed delivered` in logs | ☐ |

**Verification command:**
```bash
# Check MQTT connection status
grep -i "MQTT" backend.log | grep -i "connect\|subscribe" | tail -10
```

### A3. Agent MQTT Connectivity

| Check | Expected | PASS/FAIL |
|-------|----------|-----------|
| Agent connects to MQTT broker | `[MQTT] Connected to broker` in agent logs | ☐ |
| Agent subscribes to `agent/{id}/command` | `[MQTT] Subscribed to command topic` in logs | ☐ |
| Agent handles `start_paging_session` command type | Handler registered (code review) | ☐ |

---

## B) Canary Tenant Checks (Flag On)

### B1. Paging Start - Success Path

| Step | Expected | PASS/FAIL |
|------|----------|-----------|
| 1. Set `USE_MQTT_PAGING_CONTROL_PLANE=true` for test tenant | Flag enabled | ☐ |
| 2. Call `POST /api/paging/session/start` | HTTP 200 within 15s | ☐ |
| 3. Response contains `sessionId` | Non-empty string | ☐ |
| 4. Response contains `agentId` | Non-empty string | ☐ |
| 5. Response contains `wsUrl` | Valid WebSocket URL | ☐ |
| 6. Backend logs show MQTT publish | `[MQTT_DEBUG] Publishing command` with `start_paging_session` | ☐ |
| 7. Agent logs show command received | `[MQTT] Received command` with `start_paging_session` | ☐ |
| 8. Agent logs show reply sent | `paging_session_ready` published | ☐ |
| 9. Backend logs show reply received | `paging_session_ready` with matching `requestId` | ☐ |
| 10. Browser can connect to `wsUrl` | WebSocket opens successfully | ☐ |
| 11. Audio streams to speakers | RTP multicast received on LAN | ☐ |

**Log fields to verify (backend):**
- `requestId` present
- `sessionId` present
- `tenantId` present
- `agentId` present
- `zoneId` present

### B2. Paging Start - Failure Paths

#### B2a. MQTT Broker Unavailable

| Step | Expected | PASS/FAIL |
|------|----------|-----------|
| 1. Simulate MQTT broker down (or disconnect) | Backend loses MQTT connection | ☐ |
| 2. Call `POST /api/paging/session/start` | HTTP 503 Service Unavailable | ☐ |
| 3. Response contains error message | `"MQTT client not connected"` or similar | ☐ |

#### B2b. Agent Not Connected

| Step | Expected | PASS/FAIL |
|------|----------|-----------|
| 1. Stop the target agent | Agent offline | ☐ |
| 2. Call `POST /api/paging/session/start` | HTTP 504 Gateway Timeout (after 15s) | ☐ |
| 3. Response contains error message | `"Agent did not respond"` or similar | ☐ |

#### B2c. Agent Returns Error

| Step | Expected | PASS/FAIL |
|------|----------|-----------|
| 1. Request paging to invalid zone | Agent cannot resolve zone | ☐ |
| 2. Agent returns `paging_session_error` | `errorCode: ZONE_NOT_FOUND` | ☐ |
| 3. Backend returns HTTP 404 | Error propagated to browser | ☐ |

### B3. Paging Stop

| Step | Expected | PASS/FAIL |
|------|----------|-----------|
| 1. Start a paging session | Session active | ☐ |
| 2. Call `POST /api/paging/session/stop` | HTTP 200 immediately | ☐ |
| 3. Backend logs show MQTT publish | `stop_paging_session` published | ☐ |
| 4. Agent logs show command received | `stop_paging_session` handled | ☐ |
| 5. RTP stream stops | No more multicast packets | ☐ |

### B4. Mid-Session Resilience

#### B4a. Backend Restart Mid-Page

| Step | Expected | PASS/FAIL |
|------|----------|-----------|
| 1. Start a paging session | Audio streaming | ☐ |
| 2. Restart backend | Backend restarts | ☐ |
| 3. Verify audio continues | RTP still flowing | ☐ |
| 4. Browser WS still connected | No disconnect | ☐ |

#### B4b. Agent Restart Mid-Page

| Step | Expected | PASS/FAIL |
|------|----------|-----------|
| 1. Start a paging session | Audio streaming | ☐ |
| 2. Restart agent | Agent restarts | ☐ |
| 3. Verify audio stops | RTP stops | ☐ |
| 4. Browser WS closes | Disconnect observed | ☐ |

---

## C) Regression Checks (Flag Off)

### C1. Legacy Paging Bridge Path

| Step | Expected | PASS/FAIL |
|------|----------|-----------|
| 1. Set `USE_MQTT_PAGING_CONTROL_PLANE=false` | Flag disabled | ☐ |
| 2. Verify Paging Bridge is running | WS server listening | ☐ |
| 3. Call `POST /api/paging/session/start` | HTTP 200 | ☐ |
| 4. Response contains `wsUrl` | Valid WebSocket URL | ☐ |
| 5. Audio streams successfully | RTP multicast received | ☐ |

**Note**: This check is only needed during the rollout period when both paths are supported.

---

## D) Offline Paging Regression Check

### D1. Phase 1 Offline Paging Unchanged

| Step | Expected | PASS/FAIL |
|------|----------|-----------|
| 1. Disconnect agent from Internet | No cloud connectivity | ☐ |
| 2. Navigate to `http://<agent>:3000/offline-paging` | UI loads | ☐ |
| 3. Cached zones are displayed | Zone list visible | ☐ |
| 4. Click "Page" on a zone | Microphone prompt appears | ☐ |
| 5. Allow microphone and speak | Status shows "Paging" | ☐ |
| 6. Audio heard on speakers | RTP multicast received | ☐ |
| 7. Click "Stop Paging" | Audio stops | ☐ |
| 8. Check `offline-audit.log` | Paging event logged | ☐ |

**Critical**: Phase 1 offline paging must work exactly as documented in `docs/08-offline-paging-validation.md`.

---

## E) Observability Checks

### E1. Required Log Fields

| Field | Present in Backend Logs | Present in Agent Logs | PASS/FAIL |
|-------|------------------------|----------------------|-----------|
| `requestId` | ☐ | ☐ | ☐ |
| `sessionId` | ☐ | ☐ | ☐ |
| `tenantId` | ☐ | ☐ | ☐ |
| `agentId` | ☐ | ☐ | ☐ |
| `zoneId` | ☐ | N/A | ☐ |
| `type` (command type) | ☐ | ☐ | ☐ |
| `timestamp` | ☐ | ☐ | ☐ |

### E2. Latency Metrics

| Metric | Target | Observed | PASS/FAIL |
|--------|--------|----------|-----------|
| Paging start latency (P50) | < 500ms | ___ms | ☐ |
| Paging start latency (P95) | < 2000ms | ___ms | ☐ |
| Paging start latency (P99) | < 5000ms | ___ms | ☐ |

### E3. Alerting Recommendations

| Alert | Condition | Severity |
|-------|-----------|----------|
| Paging start timeout rate | > 5% of requests return 504 | High |
| MQTT connection lost | Backend loses MQTT connection | High |
| Agent not responding | Specific agent times out repeatedly | Medium |
| Paging error rate | > 10% of requests return 4xx/5xx | Medium |

---

## F) Rollout Sign-Off

| Milestone | Date | Signed By |
|-----------|------|-----------|
| Pre-deploy checks complete | ________ | ________ |
| Canary tenant validated | ________ | ________ |
| Regression checks passed | ________ | ________ |
| Offline paging verified | ________ | ________ |
| 10% rollout complete | ________ | ________ |
| 50% rollout complete | ________ | ________ |
| 100% rollout complete | ________ | ________ |
| Paging Bridge deprecated | ________ | ________ |

---

## Rollback Procedure

If issues are detected during rollout:

1. **Immediate**: Set `USE_MQTT_PAGING_CONTROL_PLANE=false` in backend config
2. **Verify**: Confirm paging works via Paging Bridge path
3. **Investigate**: Review logs for `requestId` of failed requests
4. **Fix**: Address root cause before re-enabling

**Rollback does NOT affect active sessions** — media-plane is decoupled from control-plane.
