import { eventDef } from './helpers';

/** Inbound webhooks are simulated. No external system is connected. */
export const WEBHOOK_EVENTS = [
  eventDef({
    id: 'webhook-alert',
    label: 'Webhook received',
    icon: 'email',
    accent: 'sky',
    ingressLabel: 'Simulated inbound webhook',
    received: 'Webhook payload accepted',
    conditions: 'JSON valid · Shared secret checked in this simulation',
    routing: 'Map payload to a notification flow',
    dispatch: 'Notify by email and SMS',
    actionList: [
      { type: 'email', label: 'Email Notification', result: 'Simulated email from the webhook payload.' },
      { type: 'sms', label: 'SMS Notification', result: 'Simulated SMS from the webhook payload.' },
    ],
  }),
  eventDef({
    id: 'webhook-incident',
    label: 'Incident payload',
    icon: 'emergency',
    accent: 'rose',
    ingressLabel: 'Simulated incident system',
    received: 'Incident webhook received',
    conditions: 'Severity high · Source marked simulated',
    routing: 'Escalate to voice and email',
    dispatch: 'Run the incident notification flow',
    actionList: [
      { type: 'phone', label: 'Phone Call', result: 'Simulated call to the on-call desk.' },
      { type: 'email', label: 'Email Notification', result: 'Simulated incident email to operations.' },
    ],
  }),
  eventDef({
    id: 'webhook-sync',
    label: 'Device sync',
    icon: 'device',
    accent: 'cyan',
    ingressLabel: 'Simulated integration sync',
    received: 'Sync webhook received',
    conditions: 'Device id present · Command allowed',
    routing: 'Translate payload into a device action',
    dispatch: 'Queue the simulated command',
    actionList: [
      { type: 'device', label: 'Device Command', result: 'Simulated command acknowledged by the gateway.' },
    ],
  }),
];
