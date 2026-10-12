import { eventDef } from './helpers';

/**
 * Each step is one line of the flow. The matching action is what the right card shows.
 * Waits and conditions stay in the sequence so the branch is visible.
 */
const INTRO_FLOW_DEFS = [
  {
    id: 'water-leak-response',
    label: 'Water Leak Response',
    icon: 'water',
    iconFile: 'water-leak',
    accent: 'cyan',
    steps: [
      {
        flow: 'Send SMS to maintenance',
        type: 'sms',
        action: 'SMS to maintenance',
        result: 'Texting the maintenance team.',
      },
      {
        flow: 'Wait 2 minutes for acknowledgment',
        type: 'wait',
        action: 'Wait 2 minutes',
        result: 'No acknowledgment arrives.',
      },
      {
        flow: 'If none, call supervisor',
        type: 'phone',
        action: 'Call supervisor',
        result: 'Calling the supervisor.',
      },
      {
        flow: 'Activate strobe',
        type: 'strobe',
        action: 'Activate strobe',
        result: 'The strobe is flashing.',
      },
    ],
  },
  {
    id: 'emergency-response',
    label: 'Emergency Response',
    icon: 'emergency',
    iconFile: 'emergency-response',
    accent: 'rose',
    steps: [
      {
        flow: 'Activate SIP paging',
        type: 'paging',
        action: 'SIP paging',
        result: 'Paging the zone, Play a message.',
      },
      {
        flow: 'Flash strobes',
        type: 'strobe',
        action: 'Flash strobes',
        result: 'Strobes are flashing.',
      },
      {
        flow: 'Notify staff',
        type: 'notification',
        action: 'Notify staff',
        result: 'A notification is showing for staff.',
      },
      {
        flow: 'Wait for acknowledgment',
        type: 'wait',
        action: 'Wait for acknowledgment',
        result: 'No acknowledgment arrives.',
      },
      {
        flow: 'If none, call security',
        type: 'phone',
        action: 'Call security',
        result: 'Calling security.',
      },
    ],
  },
  {
    id: 'equipment-failure',
    label: 'Equipment Failure Monitoring',
    icon: 'temperature',
    iconFile: 'equipment-failure',
    accent: 'orange',
    steps: [
      {
        flow: 'Send temperature warning',
        type: 'sms',
        action: 'Temperature warning',
        result: 'Sending the temperature warning.',
      },
      {
        flow: 'Wait and recheck temperature',
        type: 'wait',
        action: 'Recheck temperature',
        result: 'The temperature is still high.',
      },
      {
        flow: 'Notify technician',
        type: 'notification',
        action: 'Notify technician',
        result: 'Notifying the technician.',
      },
      {
        flow: 'If unresolved, escalate to maintenance supervisor',
        type: 'phone',
        action: 'Escalate to supervisor',
        result: 'Calling the maintenance supervisor.',
      },
    ],
  },
  {
    id: 'school-lockdown',
    label: 'School Lockdown',
    icon: 'bell',
    iconFile: 'lockdown',
    accent: 'amber',
    steps: [
      {
        flow: 'Activate emergency paging',
        type: 'paging',
        action: 'Emergency paging',
        result: 'The emergency page is playing.',
      },
      {
        flow: 'Flash strobes',
        type: 'strobe',
        action: 'Flash strobes',
        result: 'Strobes are flashing.',
      },
      {
        flow: 'Send staff notifications',
        type: 'notification',
        action: 'Staff notifications',
        result: 'Notifying staff.',
      },
      {
        flow: 'Collect acknowledgments',
        type: 'wait',
        action: 'Collect acknowledgments',
        result: 'Waiting for staff to acknowledge.',
      },
      {
        flow: 'Wait for authorized All-Clear',
        type: 'wait',
        action: 'Wait for All-Clear',
        result: 'Waiting for an authorized all-clear.',
      },
      {
        flow: 'Announce All-Clear',
        type: 'paging',
        action: 'Announce All-Clear',
        result: 'Playing the all-clear announcement.',
      },
      {
        flow: 'Update Algo displays',
        type: 'display',
        action: 'Update Algo displays',
        result: 'Algo displays now show all-clear.',
        displayText: 'ALL CLEAR',
      },
    ],
  },
];

function buildIntroFlow(def) {
  return {
    ...eventDef({
      id: def.id,
      label: def.label,
      icon: def.icon,
      accent: def.accent,
      ingressLabel: def.label,
      received: `${def.label} started`,
      conditions: `${def.steps.length} steps in this flow`,
      routing: 'Signal Bridge follows the flow',
      dispatch: 'Run each step in order',
      actionList: def.steps.map((step) => ({
        type: step.type,
        label: step.action,
        result: step.result,
        ...(step.displayText ? { displayText: step.displayText } : {}),
      })),
      timings: { stepMs: 50, actionStaggerMs: 160, completeHoldMs: 80 },
    }),
    iconFile: def.iconFile,
    lessonSteps: def.steps.map((step) => step.flow),
  };
}

export const INTRO_FLOWS = INTRO_FLOW_DEFS.map(buildIntroFlow);
