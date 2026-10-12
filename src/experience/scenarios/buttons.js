import { eventDef } from './helpers';

/** One button, one simulated action. Flows are taught in a later module. */
export const DEMO_BUTTONS = [
  {
    id: 'call-help',
    label: 'Call for help',
    blurb: 'Call the help number.',
    tone: 'blue',
    icon: 'phone',
    iconFile: 'phone',
    action: { type: 'phone', label: 'Calling help number', result: 'Calling the help number.' },
  },
  {
    id: 'message-someone',
    label: 'Message someone',
    blurb: 'Send a text message.',
    tone: 'sky',
    icon: 'sms',
    iconFile: 'sms',
    action: { type: 'sms', label: 'SMS someone', result: 'Sending a text to someone.' },
  },
  {
    id: 'email-someone',
    label: 'Email someone',
    blurb: 'Send an email.',
    tone: 'amber',
    icon: 'email',
    iconFile: 'envelope',
    action: { type: 'email', label: 'Email someone', result: 'Sending an email to someone.' },
  },
  {
    id: 'notify-someone',
    label: 'Notify someone',
    blurb: 'Show a notification.',
    tone: 'green',
    icon: 'notification',
    iconFile: 'message',
    action: { type: 'notification', label: 'Notification', result: 'A notification is showing.' },
  },
];

export function buildButtonEvents() {
  return DEMO_BUTTONS.map((button) => ({
    ...eventDef({
      id: button.id,
      label: button.label,
      icon: button.icon,
      accent: button.tone === 'green' ? 'emerald' : button.tone === 'amber' ? 'amber' : 'sky',
      ingressLabel: button.blurb,
      received: 'Button press detected',
      conditions: button.label,
      routing: 'Signal Bridge starts the action',
      dispatch: button.action.label,
      actionList: [button.action],
      timings: { stepMs: 640, actionStaggerMs: 200, completeHoldMs: 180 },
    }),
    tone: button.tone,
    blurb: button.blurb,
    iconFile: button.iconFile,
    tile: true,
  }));
}
