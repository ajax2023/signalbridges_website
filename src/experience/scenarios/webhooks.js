import { eventDef } from './helpers';

/** Inbound webhooks are simulated. No external system is connected. */
export const WEBHOOK_EVENTS = [
  eventDef({
    id: 'webhook-alert',
    label: 'Webhook received',
    icon: 'email',
    accent: 'sky',
    ingressLabel: 'Inbound webhook',
    received: 'Webhook payload accepted',
    conditions: 'JSON valid · Source recognized',
    routing: 'Map payload to a notification flow',
    dispatch: 'Notify by email and SMS',
    actionList: [
      { type: 'email', label: 'Email Notification', result: 'Email created from the webhook payload.' },
      { type: 'sms', label: 'SMS Notification', result: 'SMS created from the webhook payload.' },
    ],
  }),
  eventDef({
    id: 'webhook-incident',
    label: 'Incident payload',
    icon: 'emergency',
    accent: 'rose',
    ingressLabel: 'Incident system',
    received: 'Incident webhook received',
    conditions: 'Severity high · Source recognized',
    routing: 'Escalate to voice and email',
    dispatch: 'Run the incident notification flow',
    actionList: [
      { type: 'phone', label: 'Phone Call', result: 'Call placed to the on-call desk.' },
      { type: 'email', label: 'Email Notification', result: 'Incident email sent to operations.' },
    ],
  }),
  eventDef({
    id: 'webhook-sync',
    label: 'Device sync',
    icon: 'device',
    accent: 'cyan',
    ingressLabel: 'Integration sync',
    received: 'Sync webhook received',
    conditions: 'Device id present · Command allowed',
    routing: 'Translate payload into a device action',
    dispatch: 'Dispatch the device command',
    actionList: [
      { type: 'device', label: 'Device Command', result: 'Command acknowledged by the gateway.' },
    ],
  }),
];
