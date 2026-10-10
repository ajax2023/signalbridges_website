/** Phase 1 — General Signal Bridge demonstration (simulated only). */

export const GENERAL_SCENARIO = {
  id: 'general',
  title: 'Signal Bridge',
  subtitle: 'Events → Flows → Actions',
  description: 'Select a sensor event to watch a simulated automation path run.',
  events: [
    {
      id: 'water-leak',
      label: 'Water leak',
      shortLabel: 'Leak',
      icon: 'water',
      accent: 'cyan',
      ingressLabel: 'Moisture sensor · Basement B2',
      flowSteps: [
        { id: 'received', label: 'Event received', detail: 'Moisture threshold exceeded' },
        { id: 'conditions', label: 'Conditions evaluated', detail: 'Severity high · Occupied hours' },
        { id: 'response', label: 'Response selected', detail: 'Facilities water-response flow' },
        { id: 'dispatch', label: 'Actions dispatched', detail: 'Notify · Page · Isolate' },
      ],
      actions: [
        {
          id: 'email',
          type: 'email',
          label: 'Email notification',
          result: 'Sent to facilities@example.com',
        },
        {
          id: 'phone',
          type: 'phone',
          label: 'Phone call',
          result: 'Call placed to on-call facilities lead',
        },
        {
          id: 'paging',
          type: 'paging',
          label: 'Speaker paging',
          result: 'Zone page: Basement B2 — water alert',
        },
        {
          id: 'device',
          type: 'device',
          label: 'Device activation',
          result: 'Shutoff valve command queued',
        },
      ],
      timings: {
        stepMs: 720,
        actionStaggerMs: 420,
        completeHoldMs: 200,
      },
    },
    {
      id: 'door-opened',
      label: 'Door opened',
      shortLabel: 'Door',
      icon: 'door',
      accent: 'amber',
      ingressLabel: 'Access sensor · Loading dock',
      flowSteps: [
        { id: 'received', label: 'Event received', detail: 'Door contact opened after hours' },
        { id: 'conditions', label: 'Conditions evaluated', detail: 'Schedule = secured · Badge absent' },
        { id: 'response', label: 'Response selected', detail: 'Security intrusion flow' },
        { id: 'dispatch', label: 'Actions dispatched', detail: 'Alert · Call · Page · Lock' },
      ],
      actions: [
        {
          id: 'email',
          type: 'email',
          label: 'Email notification',
          result: 'Sent to security-ops@example.com',
        },
        {
          id: 'phone',
          type: 'phone',
          label: 'Phone call',
          result: 'Call placed to security desk',
        },
        {
          id: 'paging',
          type: 'paging',
          label: 'Speaker paging',
          result: 'Dock zone page: unauthorized access',
        },
        {
          id: 'device',
          type: 'device',
          label: 'Device activation',
          result: 'Magnetic lock re-engage requested',
        },
      ],
      timings: {
        stepMs: 680,
        actionStaggerMs: 380,
        completeHoldMs: 200,
      },
    },
    {
      id: 'high-temperature',
      label: 'High temperature',
      shortLabel: 'Heat',
      icon: 'temperature',
      accent: 'orange',
      ingressLabel: 'Thermal sensor · Server room A',
      flowSteps: [
        { id: 'received', label: 'Event received', detail: 'Temperature 34.2°C (threshold 30°C)' },
        { id: 'conditions', label: 'Conditions evaluated', detail: 'Trend rising · HVAC online' },
        { id: 'response', label: 'Response selected', detail: 'Thermal protection flow' },
        { id: 'dispatch', label: 'Actions dispatched', detail: 'Notify · Call · Cool · Page' },
      ],
      actions: [
        {
          id: 'email',
          type: 'email',
          label: 'Email notification',
          result: 'Sent to infra-ops@example.com',
        },
        {
          id: 'phone',
          type: 'phone',
          label: 'Phone call',
          result: 'Call placed to NOC on-call',
        },
        {
          id: 'paging',
          type: 'paging',
          label: 'Speaker paging',
          result: 'NOC page: thermal alert — Room A',
        },
        {
          id: 'device',
          type: 'device',
          label: 'Device activation',
          result: 'CRAC boost setpoint applied',
        },
      ],
      timings: {
        stepMs: 700,
        actionStaggerMs: 400,
        completeHoldMs: 200,
      },
    },
    {
      id: 'device-offline',
      label: 'Device offline',
      shortLabel: 'Offline',
      icon: 'offline',
      accent: 'rose',
      ingressLabel: 'Edge agent · Building 3',
      flowSteps: [
        { id: 'received', label: 'Event received', detail: 'Heartbeat missed (90s)' },
        { id: 'conditions', label: 'Conditions evaluated', detail: 'Peer agents healthy · WAN up' },
        { id: 'response', label: 'Response selected', detail: 'Edge health response flow' },
        { id: 'dispatch', label: 'Actions dispatched', detail: 'Escalate · Call · Page · Failover' },
      ],
      actions: [
        {
          id: 'email',
          type: 'email',
          label: 'Email notification',
          result: 'Sent to platform-ops@example.com',
        },
        {
          id: 'phone',
          type: 'phone',
          label: 'Phone call',
          result: 'Call placed to platform on-call',
        },
        {
          id: 'paging',
          type: 'paging',
          label: 'Speaker paging',
          result: 'Ops page: Building 3 agent offline',
        },
        {
          id: 'device',
          type: 'device',
          label: 'Device activation',
          result: 'Standby agent promotion requested',
        },
      ],
      timings: {
        stepMs: 740,
        actionStaggerMs: 440,
        completeHoldMs: 200,
      },
    },
  ],
};

export const SCENARIOS = {
  [GENERAL_SCENARIO.id]: GENERAL_SCENARIO,
};

export const DEFAULT_SCENARIO_ID = GENERAL_SCENARIO.id;
