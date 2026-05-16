# Offline Paging Validation Checklist

This document provides a validation checklist for operators and support to verify that offline paging is working correctly.

## Pre-requisites

Before testing offline paging, ensure:

- [ ] Agent is installed and running on the edge host
- [ ] Agent has been online at least once to sync paging zone configuration
- [ ] At least one paging zone is configured in the tenant with valid multicast groups
- [ ] Operator has a browser on the same LAN as the agent (or routed access)
- [ ] Algo speakers/devices are on the LAN and configured to receive multicast
- [ ] (Optional) If validating cloud-synced audits: `OFFLINE_AUDIT_SYNC_ENABLED=true` on the agent and agent can reach `API_BASE_URL`

## Operator Validation (How to verify offline paging works)

### Step 1: Verify agent is running

```bash
# Check agent process (Linux/macOS)
ps aux | grep headlessHost

# Or check the agent's HTTP endpoint
curl http://<agent-host>:3000/api/offline/paging/status
```

**Expected result**: Agent responds with cache status JSON.

### Step 2: Access the offline paging UI

1. Open a browser on the LAN
2. Navigate to `http://<agent-host>:3000/offline-paging`

**Expected result**: 
- Page loads with "Offline Paging" title
- Warning banner about offline mode is visible
- Status shows "Ready"

### Step 3: Verify cached zones are available

**Expected result**:
- "Paging Zones" section shows one or more zones
- Each zone displays name and multicast group:port
- "Cache Info" shows last sync timestamp

**If no zones appear**:
- Agent may not have synced while online
- Check agent logs for `[PAGING-CACHE]` or `[OFFLINE-PAGING]` entries
- Ensure agent has valid `tenantId` and JWT token in storage

### Step 4: Test paging to a zone

1. Click "Page" button for a zone
2. Allow microphone access when prompted
3. Speak into the microphone

**Expected result**:
- Status changes to "Paging to [Zone Name] - Speak now"
- Microphone indicator pulses green
- "Stop Paging" button appears
- Audio is heard on speakers in the target zone

### Step 5: Stop paging

1. Click "Stop Paging" button

**Expected result**:
- Status returns to "Stopped" then "Ready"
- Audio stops on speakers
- "Stop Paging" button disappears

### Step 6: Verify audit logging (optional)

Check the agent's offline audit log:

```bash
# Location depends on agent installation
# Electron app (macOS):
cat ~/Library/Application\ Support/AlgoDeviceManager/logs/offline-audit.log

# Headless agent:
cat <HEADLESS_STORAGE_PATH>/logs/offline-audit.log
```

**Expected result**: Log entries with `offline_command_execution` events for paging commands.

### Step 7: Verify audit sync to cloud (optional)

Offline paging audit sync is **feature-flagged** and does not block offline paging.
By default it is disabled:

```bash
OFFLINE_AUDIT_SYNC_ENABLED=false  # default
```

To validate cloud sync behavior:

1. Ensure agent has connectivity to the backend (`API_BASE_URL`) and its agent JWT is valid.
2. Set `OFFLINE_AUDIT_SYNC_ENABLED=true` and restart the agent.
3. Perform an offline paging action (Steps 1-5) so `offline-audit.log` receives new entries.
4. Restore cloud connectivity (or wait for MQTT connect / heartbeat success).

**Expected result**:
- Agent log shows a sync message (e.g. `[OFFLINE_AUDIT_SYNC] Synced batch`)
- Agent writes/updates sync state file:
  - `<agent-data-dir>/logs/offline-audit-sync-state.json`
- Firestore contains documents in:
  - `tenants/{tenantId}/offlinePagingAuditEvents/{eventId}`

## Support Validation (How to confirm system is behaving as documented)

### Cache sync verification

1. **Check cache file exists**:
   ```bash
   cat <agent-data-dir>/offline-paging-cache.json
   ```
   
2. **Verify cache contents**:
   - `version` should be `1`
   - `lastUpdated` should be a recent ISO timestamp
   - `zones` array should contain zone objects with `id`, `name`, `multicastGroups`

3. **Check agent logs for sync activity**:
   ```
   [HEADLESS-MEDIA][OFFLINE-PAGING] Cache synced successfully
   ```

### API endpoint verification

Test each offline paging API endpoint:

```bash
# List zones
curl http://<agent-host>:3000/api/offline/paging/zones

# Get zone params (replace ZONE_ID)
curl http://<agent-host>:3000/api/offline/paging/zone/ZONE_ID

# Get cache status
curl http://<agent-host>:3000/api/offline/paging/status
```

### WebSocket audio path verification

Use a WebSocket client to test the audio endpoint:

```bash
# Using wscat (npm install -g wscat)
wscat -c "ws://<agent-host>:3000/ws/live-audio?group=239.0.0.1&port=5000&ttl=1&commandId=test-123"
```

**Expected result**: Connection opens successfully. Sending binary data should result in RTP packets on the multicast group.

### RTP output verification

Use a network capture tool to verify RTP packets:

```bash
# Using tcpdump (requires root/admin)
sudo tcpdump -i any udp port 5000 and host 239.0.0.1
```

**Expected result**: UDP packets appear when audio is being streamed.

## Failure Scenarios

### Scenario: No zones cached

**Symptom**: UI shows "No zones cached. Connect to cloud to sync."

**Resolution**:
1. Ensure agent has network connectivity to cloud
2. Wait for periodic policy refresh (default 5 minutes)
3. Check agent logs for sync errors
4. Verify `tenantId` and JWT token are present in agent storage

### Scenario: Zone not found

**Symptom**: Clicking "Page" shows "Zone not found or invalid"

**Resolution**:
1. Zone may have been deleted in cloud after last sync
2. Force a cache refresh by restarting agent while online
3. Verify zone exists in cloud admin UI

### Scenario: WebSocket connection fails

**Symptom**: Status shows "WebSocket error" or "Disconnected"

**Resolution**:
1. Verify agent is running and listening on expected port
2. Check for firewall blocking WebSocket connections
3. Verify browser can reach agent host (try `/api/offline/paging/status`)

### Scenario: No audio on speakers

**Symptom**: Paging appears to work but no audio is heard

**Resolution**:
1. Verify multicast group/port matches speaker configuration
2. Check TTL value (may need higher TTL for cross-VLAN)
3. Verify multicast routing is enabled on network infrastructure
4. Test with a multicast listener tool on the same VLAN as speakers

### Scenario: Microphone not working

**Symptom**: Status shows "Microphone error" or no audio indicator

**Resolution**:
1. Check browser microphone permissions
2. Try a different browser
3. Verify microphone works in other applications
4. For HTTPS requirement issues, access via `localhost` or configure HTTPS on agent

## Documentation References

- Deployment Scope: `docs/02-deployment-scope.md` → "Offline Paging Mode" section
- Data Flows: `docs/03-data-flows.md` → "4b) Offline Paging (Local Agent Only)"
- System Map: `docs/01-system-map.md` → "Offline Paging Mode (Agent Operating Independently)"
- Known Assumptions: `docs/06-known-assumptions.md` → "Offline Paging Assumptions"
- Open Questions: `docs/07-open-questions.md` → "Offline Paging" sections
