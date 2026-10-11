import { eventDef } from './helpers';

export const BUTTON_SCENARIOS = [
  {
    id: 'basic-alert',
    label: 'Basic Alert',
    description: 'Call staff and flash strobe.',
    icon: 'basic',
  },
  {
    id: 'multi-channel',
    label: 'Multi-Channel',
    description: 'Call, SMS and display.',
    icon: 'channels',
  },
  {
    id: 'paging',
    label: 'Paging',
    description: 'Make an announcement.',
    icon: 'paging',
  },
  {
    id: 'custom-flow',
    label: 'Custom Flow',
    description: 'Try a multi-step workflow.',
    icon: 'flow',
  },
];

export const DEMO_BUTTONS = [
  {
    id: 'emergency',
    label: 'Emergency Button',
    blurb: 'Alert staff and activate devices.',
    tone: 'red',
    place: 'Main Entrance',
    displayText: 'EMERGENCY\nASSISTANCE REQUIRED',
  },
  {
    id: 'help',
    label: 'Help Button',
    blurb: 'Call for assistance.',
    tone: 'blue',
    place: 'Room 214',
    displayText: 'ASSISTANCE\nREQUESTED',
  },
  {
    id: 'door',
    label: 'Door Button',
    blurb: 'Notify reception.',
    tone: 'green',
    place: 'Front lobby',
    displayText: 'VISITOR AT\nRECEPTION',
  },
  {
    id: 'info',
    label: 'Info Button',
    blurb: 'Send a message.',
    tone: 'amber',
    place: 'Information desk',
    displayText: 'INFORMATION\nREQUEST',
  },
];

const SCENARIO_TIMINGS = {
  'basic-alert': { stepMs: 620, actionStaggerMs: 140, completeHoldMs: 160 },
  'multi-channel': { stepMs: 680, actionStaggerMs: 420, completeHoldMs: 200 },
  paging: { stepMs: 700, actionStaggerMs: 360, completeHoldMs: 180 },
  'custom-flow': { stepMs: 760, actionStaggerMs: 560, completeHoldMs: 260 },
};

function phoneAction(button) {
  const results = {
    emergency: 'Calling security…',
    help: 'Calling for assistance…',
    door: 'Calling reception…',
    info: 'Calling the information desk…',
  };
  return { type: 'phone', label: 'Phone Call', result: results[button.id] };
}

function smsAction(button) {
  const lead = {
    emergency: 'Emergency button pressed',
    help: 'Help requested',
    door: 'Door button pressed',
    info: 'Information request',
  };
  return {
    type: 'sms',
    label: 'SMS Notification',
    result: `Message sent to staff. ${lead[button.id]} · ${button.place}`,
  };
}

function strobeAction() {
  return {
    type: 'strobe',
    label: 'Strobe Activated',
    result: 'Flashing for 10 seconds.',
  };
}

function displayAction(button) {
  return {
    type: 'display',
    label: 'Display Message',
    result: 'Showing alert on Algo 8410.',
    displayText: button.displayText,
  };
}

function pagingAction(button) {
  const results = {
    emergency: 'Emergency announcement on building speakers.',
    help: 'Assistance announcement on the nearest zone.',
    door: 'Reception announcement: visitor at the front lobby.',
    info: 'Informational announcement on the office speakers.',
  };
  return { type: 'paging', label: 'Paging Announcement', result: results[button.id] };
}

function emailAction(button) {
  return {
    type: 'email',
    label: 'Email Notification',
    result: `Notice sent to the staff list for ${button.place}.`,
  };
}

function actionsFor(button, scenarioId) {
  if (scenarioId === 'basic-alert') return [phoneAction(button), strobeAction()];
  if (scenarioId === 'multi-channel') return [phoneAction(button), smsAction(button), displayAction(button)];
  if (scenarioId === 'paging') return [pagingAction(button)];
  return [
    phoneAction(button),
    smsAction(button),
    emailAction(button),
    strobeAction(),
    displayAction(button),
    pagingAction(button),
  ];
}

export function buildButtonEvents(scenarioId = 'basic-alert') {
  const scenario = BUTTON_SCENARIOS.find((item) => item.id === scenarioId) || BUTTON_SCENARIOS[0];
  return DEMO_BUTTONS.map((button) => ({
    ...eventDef({
      id: button.id,
      label: button.label,
      icon: button.id,
      accent: button.tone === 'red' ? 'rose' : button.tone === 'green' ? 'emerald' : button.tone === 'amber' ? 'amber' : 'sky',
      ingressLabel: button.blurb,
      received: 'Button press detected',
      conditions: `${button.label} · ${scenario.label}`,
      routing: 'Signal Bridge matched the scenario',
      dispatch: 'Calling, notifying, activating devices',
      actionList: actionsFor(button, scenario.id),
      timings: SCENARIO_TIMINGS[scenario.id],
    }),
    tone: button.tone,
    blurb: button.blurb,
  }));
}
