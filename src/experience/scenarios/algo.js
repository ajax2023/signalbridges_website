import { eventDef } from './helpers';

/** Simulated Algo device outcomes. Not connected to live hardware. */
export const ALGO_EVENTS = [
  eventDef({
    id: 'algo-strobe',
    label: 'Visual strobe',
    icon: 'strobe',
    accent: 'rose',
    ingressLabel: 'Simulated Algo strobe',
    received: 'Visual alert requested',
    conditions: 'Strobe pattern selected',
    routing: 'Route to visual alert devices',
    dispatch: 'Start strobe pattern',
    actionList: [
      { type: 'strobe', label: 'Strobe Activated', result: 'Simulated strobe flashing for 10 seconds.' },
    ],
  }),
  eventDef({
    id: 'algo-display',
    label: 'Display message',
    icon: 'display',
    accent: 'amber',
    ingressLabel: 'Simulated Algo 8410 display',
    received: 'Display message queued',
    conditions: 'Message fits the sign layout',
    routing: 'Route to display endpoint',
    dispatch: 'Update the sign',
    actionList: [
      {
        type: 'display',
        label: 'Display Message',
        result: 'Simulated message on Algo 8410.',
        displayText: 'EMERGENCY\nASSISTANCE REQUIRED',
      },
    ],
  }),
  eventDef({
    id: 'algo-audio',
    label: 'Audio alert',
    icon: 'paging',
    accent: 'sky',
    ingressLabel: 'Simulated Algo speaker',
    received: 'Audio alert requested',
    conditions: 'Zone speakers available',
    routing: 'Route to audio devices',
    dispatch: 'Play the alert tone',
    actionList: [
      { type: 'paging', label: 'Paging Announcement', result: 'Simulated tone on Algo speakers.' },
    ],
  }),
  eventDef({
    id: 'algo-combined',
    label: 'Visual and audio',
    icon: 'multi',
    accent: 'violet',
    ingressLabel: 'Simulated Algo combination',
    received: 'Combined device alert requested',
    conditions: 'Display, strobe, and speaker selected',
    routing: 'Fan out to Algo device types',
    dispatch: 'Activate visual and audio together',
    actionList: [
      { type: 'strobe', label: 'Strobe Activated', result: 'Simulated strobe pattern started.' },
      {
        type: 'display',
        label: 'Display Message',
        result: 'Simulated sign updated.',
        displayText: 'ALERT\nCHECK SPEAKERS',
      },
      { type: 'paging', label: 'Paging Announcement', result: 'Simulated audio alert playing.' },
    ],
    timings: { stepMs: 700, actionStaggerMs: 420, completeHoldMs: 200 },
  }),
];
