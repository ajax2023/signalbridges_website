import { eventDef } from './helpers';

export const EXPLORE_SCENARIO = {
  id: 'explore',
  title: 'Explore Signal Bridge',
  shortTitle: 'Explore',
  subtitle: 'Core platform actions',
  description: 'Trigger email, voice, strobe, paging, and multi-action paths.',
  theme: 'explore',
  events: [
    eventDef({
      id: 'send-email',
      label: 'Send email',
      icon: 'email',
      accent: 'sky',
      ingressLabel: 'Operator console · Compose',
      received: 'Email action requested',
      conditions: 'Template valid · Recipients resolved',
      routing: 'Route via notification service',
      dispatch: 'Deliver email',
      actionList: [
        {
          type: 'email',
          label: 'Email sent',
          result: 'Message delivered to ops@example.com',
        },
      ],
    }),
    eventDef({
      id: 'make-phone-call',
      label: 'Make phone call',
      icon: 'phone',
      accent: 'violet',
      ingressLabel: 'Operator console · Voice',
      received: 'Outbound call requested',
      conditions: 'On-call roster available',
      routing: 'Select voice channel',
      dispatch: 'Place call',
      actionList: [
        {
          type: 'phone',
          label: 'Phone call initiated',
          result: 'Call connected to on-call lead',
        },
      ],
    }),
    eventDef({
      id: 'activate-strobe',
      label: 'Activate strobe',
      icon: 'strobe',
      accent: 'amber',
      ingressLabel: 'Device control · Visual alert',
      received: 'Strobe activation requested',
      conditions: 'Target device online',
      routing: 'Edge agent selected',
      dispatch: 'Command device',
      actionList: [
        {
          type: 'strobe',
          label: 'Strobe activated',
          result: 'Strobe pattern A on hallway beacons',
        },
      ],
    }),
    eventDef({
      id: 'page-speaker',
      label: 'Page speaker',
      icon: 'paging',
      accent: 'cyan',
      ingressLabel: 'Paging · Zone select',
      received: 'Speaker page requested',
      conditions: 'Zone mapped · Agent healthy',
      routing: 'Prefer RTP paging path',
      dispatch: 'Emit page',
      actionList: [
        {
          type: 'paging',
          label: 'Speaker paging',
          result: 'Page playing on Building A speakers',
        },
      ],
    }),
    eventDef({
      id: 'multi-action',
      label: 'Multi-action flow',
      icon: 'multi',
      accent: 'emerald',
      ingressLabel: 'Operator console · Combined response',
      received: 'Multi-action playbook started',
      conditions: 'Severity = elevated · Audience = ops',
      routing: 'Fan-out to email, voice, page, strobe',
      dispatch: 'Coordinate all channels',
      actionList: [
        {
          type: 'email',
          label: 'Email sent',
          result: 'Alert email to operations distribution',
        },
        {
          type: 'phone',
          label: 'Phone call initiated',
          result: 'Bridge call to duty officer',
        },
        {
          type: 'sms',
          label: 'SMS notification',
          result: 'SMS sent to on-call mobile',
        },
        {
          type: 'paging',
          label: 'Speaker paging',
          result: 'Campus-wide page in progress',
        },
        {
          type: 'strobe',
          label: 'Strobe activated',
          result: 'Visual alert on priority devices',
        },
      ],
      timings: { stepMs: 720, actionStaggerMs: 360, completeHoldMs: 200 },
    }),
  ],
};
