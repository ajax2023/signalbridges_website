 # Operational Runbooks Index (v1)
 
 This index is a quick-routing guide for operators to choose the correct existing runbook/document when something goes wrong. Use it during incidents, maintenance windows, and customer support calls to avoid guessing and repeated ad-hoc steps. It intentionally does not include full procedures, architecture explanations, or any code—follow the referenced runbooks exactly.
 
 ---
 
 ## Core Operational Scenarios (Index Table)
 
 | Scenario / Symptom | Likely Cause | Primary Runbook to Follow | Notes / Warnings (DO / DO NOT) |
 |---|---|---|---|
 | Paging did not play audio | Wrong paging mode assumptions, zone/device mismatch, network path issue, media path issue | Paging documentation covering SIP vs RTP semantics | DO confirm which mode is being used (SIP vs RTP) before troubleshooting. DO NOT treat SIP and RTP failures as equivalent. |
 | SIP paging failed but RTP paging works | SIP/Twilio dependency issue, SIP credentials/routing, cloud dependency, PSTN/SIP provider issue | Paging documentation covering SIP vs RTP semantics | DO treat as expected isolation: RTP can work without Twilio while SIP cannot. DO NOT fix RTP if only SIP is broken. |
 | Agent appears offline in admin UI | Agent process stopped, network outage, firewall/DNS, host asleep, backend connectivity issue | Offline Paging Validation Checklist | DO verify offline paging still works locally if needed (separate guarantee). DO NOT assume offline UI means no local service without validating. |
 | Agent is online but actions fail | Version skew, backend policy restriction, partial connectivity, auth/token issues, command channel mismatch | Agent Control & Update Philosophy (v1) | DO check whether backend policy is restricting participation (authoritative). DO NOT repeatedly retry actions without checking policy/disablement state. |
 | Agent is disabled by admin | Backend-enforced disablement (intentional safety/ops action) | Agent Control & Update Philosophy (v1) | DO treat as authoritative and intentional until proven otherwise. DO NOT attempt repeated local restarts to work around disablement. |
 | Offline paging worked but audits are missing in cloud | Offline audit sync not enabled/policy-restricted, agent not reconnected post-outage, backlog not yet synced, log not present | Offline Paging Validation Checklist | DO verify offline audit logging occurred locally and confirm expected sync conditions. DO NOT assume missing in cloud means missing entirely without validating offline behavior first. |
 | Audit integrity verification shows broken or missing chain | Log tampering, truncation/rotation gaps, mixed versions missing hash fields, partial ingestion, corrupted lines | Offline Audit Integrity Verification (read-only) | DO treat broken chain as a security/assurance signal requiring triage. DO NOT delete/overwrite logs or attempt repair during investigation. |
 | Agent update completed but behavior is incorrect | Configuration drift, version skew behavior change, partial rollback, environment differences | Agent Update Procedure (v1) | DO run the defined post-check PASS/FAIL gates and smoke test. DO NOT perform multiple speculative changes at once; isolate by rollback if needed. |
 | Agent update failed or agent will not reconnect | Install failure, service not running, network/auth issues, identity/state not persistent | Agent Update Procedure (v1) | DO follow recovery/escalation checklist and capture logs/evidence. DO NOT repeat the update more than once without new evidence (risk: compounding failure). |
 | Suspected unsafe or compromised agent behavior | Malware/host compromise, unexpected commands/actions, integrity anomalies, unsafe traffic patterns | Agent Control & Update Philosophy (v1) | DO prioritize containment and safety: backend is authoritative and kill switch is the primary lever (policy-level). DO NOT keep it running to observe if there is credible risk to customers. |
 
 ---
 
 ## Canonical Runbook References (Use Only These)
 
 - **Agent Control & Update Philosophy (v1)**
   - **For:** Understanding backend authority, agent disablement expectations, mixed-version reality, and safety posture.
   - **When NOT to use:** When you need step-by-step update actions or validation steps (use the Update Procedure / Validation Checklist instead).
 
 - **Agent Update Procedure (v1)**
   - **For:** Manual-first agent updates (Electron and headless), PASS/FAIL gates, rollback, and recovery/escalation.
   - **When NOT to use:** For diagnosing paging-mode semantics or offline-vs-online guarantees (use Paging docs / Offline Paging Validation Checklist).
 
 - **Offline Paging Validation Checklist**
   - **For:** Validating offline paging behavior and separating offline runtime guarantees from cloud connectivity.
   - **When NOT to use:** For audit integrity chain verification (use Offline Audit Integrity Verification).
 
 - **Offline Audit Integrity Verification (read-only)**
   - **For:** Read-only integrity checks of offline audit hash chaining and continuity over synced events.
   - **When NOT to use:** As a substitute for paging troubleshooting or update rollback decisions; it’s an assurance tool, not an availability fix.
 
 - **Paging documentation covering SIP vs RTP semantics**
   - **For:** Determining which paging mode is in use and what dependencies/guarantees apply (cloud/Twilio vs offline-capable RTP).
   - **When NOT to use:** For agent update workflows or audit integrity investigations.
 
 ---
 
 > ## STOP AND ESCALATE IF:
 > - **Agent identity churn is detected** (duplicate/new agent identity appears after restart/update).
 > - **Repeated update attempts fail** (more than one attempt without new evidence/logs).
 > - **Audit integrity mismatch/broken chain appears on multiple entries** or across multiple log segments.
 > - **Agent flaps between enabled/disabled** unexpectedly (policy instability or misconfiguration).
 > - **Unsafe or suspicious behavior is observed** (unexpected actions, unexplained traffic, or credible compromise indicators).
 > - **Multiple sites/agents exhibit the same failure simultaneously** (potential backend-wide incident; stop local tinkering).
 > - **Backend refuses an agent version** and the required action is unclear (do not attempt workaround; follow explicit guidance).
 
 ---
 
 ## Final Summary
 
 This index prevents runbook drift (everyone does it differently), mode confusion (SIP vs RTP guarantees), and high-risk trial-and-error during updates, outages, and integrity signals.
 
 It reduces operational/support risk by routing operators to authoritative, already-agreed procedures with explicit DO / DO NOT guidance and clear escalation triggers. It is safe to ship without automation because it codifies manual-first control, embraces mixed versions, and relies on policy-level safety backstops (including the kill switch) rather than fragile tooling.
