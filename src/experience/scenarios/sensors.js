import { eventDef } from './helpers';

export const SENSORS_SCENARIO = {
  id: 'sensors',
  title: 'Connected sensors',
  shortTitle: 'Sensors',
  subtitle: 'IoT & facility sensors',
  description: 'Leak, access, thermal, offline, and motion events.',
  theme: 'sensors',
  events: [
    eventDef({
      id: 'water-leak',
      label: 'Water leak',
      icon: 'water',
      accent: 'cyan',
      ingressLabel: 'Moisture sensor · Basement B2',
      received: 'Moisture threshold exceeded',
      conditions: 'Severity high · Occupied hours',
      routing: 'Facilities water-response flow',
      dispatch: 'Notify · Page · Isolate',
      actionList: [
        {
          type: 'email',
          label: 'Email sent',
          result: 'Sent to facilities@example.com',
        },
        {
          type: 'phone',
          label: 'Phone call initiated',
          result: 'Call to on-call facilities lead',
        },
        {
          type: 'paging',
          label: 'Speaker paging',
          result: 'Zone page: Basement B2 water alert',
        },
        {
          type: 'device',
          label: 'Device command executed',
          result: 'Shutoff valve command queued',
        },
      ],
    }),
    eventDef({
      id: 'door-opened',
      label: 'Door opened',
      icon: 'door',
      accent: 'amber',
      ingressLabel: 'Access sensor · Loading dock',
      received: 'Door opened after hours',
      conditions: 'Schedule = secured · Badge absent',
      routing: 'Security intrusion flow',
      dispatch: 'Alert · Call · Page · Lock',
      actionList: [
        {
          type: 'email',
          label: 'Email sent',
          result: 'Sent to security-ops@example.com',
        },
        {
          type: 'phone',
          label: 'Phone call initiated',
          result: 'Call to security desk',
        },
        {
          type: 'paging',
          label: 'Speaker paging',
          result: 'Dock zone: unauthorized access',
        },
        {
          type: 'device',
          label: 'Device command executed',
          result: 'Magnetic lock re-engage requested',
        },
      ],
    }),
    eventDef({
      id: 'high-temperature',
      label: 'High temperature',
      icon: 'temperature',
      accent: 'orange',
      ingressLabel: 'Thermal sensor · Server room A',
      received: 'Temperature 34.2°C (limit 30°C)',
      conditions: 'Trend rising · HVAC online',
      routing: 'Thermal protection flow',
      dispatch: 'Notify · Call · Cool · Page',
      actionList: [
        {
          type: 'email',
          label: 'Email sent',
          result: 'Sent to infra-ops@example.com',
        },
        {
          type: 'phone',
          label: 'Phone call initiated',
          result: 'Call to NOC on-call',
        },
        {
          type: 'paging',
          label: 'Speaker paging',
          result: 'NOC page: thermal alert Room A',
        },
        {
          type: 'device',
          label: 'Device command executed',
          result: 'CRAC boost setpoint applied',
        },
      ],
    }),
    eventDef({
      id: 'device-offline',
      label: 'Device offline',
      icon: 'offline',
      accent: 'rose',
      ingressLabel: 'Edge agent · Building 3',
      received: 'Heartbeat missed (90s)',
      conditions: 'Peer agents healthy · WAN up',
      routing: 'Edge health response flow',
      dispatch: 'Escalate · Call · Page · Failover',
      actionList: [
        {
          type: 'email',
          label: 'Email sent',
          result: 'Sent to platform-ops@example.com',
        },
        {
          type: 'phone',
          label: 'Phone call initiated',
          result: 'Call to platform on-call',
        },
        {
          type: 'paging',
          label: 'Speaker paging',
          result: 'Ops page: Building 3 agent offline',
        },
        {
          type: 'device',
          label: 'Device command executed',
          result: 'Standby agent promotion requested',
        },
      ],
    }),
    eventDef({
      id: 'motion-detected',
      label: 'Motion detected',
      icon: 'motion',
      accent: 'violet',
      ingressLabel: 'PIR sensor · Warehouse aisle 7',
      received: 'Motion after secure hours',
      conditions: 'No badge swipe · Camera available',
      routing: 'Security verify-and-alert flow',
      dispatch: 'Notify security · Illuminate',
      actionList: [
        {
          type: 'sms',
          label: 'SMS notification',
          result: 'SMS to roaming security officer',
        },
        {
          type: 'phone',
          label: 'Phone call initiated',
          result: 'Call to security operations',
        },
        {
          type: 'device',
          label: 'Device command executed',
          result: 'Aisle lighting boosted to 100%',
        },
        {
          type: 'email',
          label: 'Email sent',
          result: 'Incident note to security log',
        },
      ],
    }),
  ],
};
