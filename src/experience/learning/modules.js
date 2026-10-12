import { EDUCATION_SCENARIO } from '../scenarios/education';
import { EXPLORE_SCENARIO } from '../scenarios/explore';
import { SENSORS_SCENARIO } from '../scenarios/sensors';
import { ALGO_EVENTS } from '../scenarios/algo';
import { SIP_EVENTS } from '../scenarios/sip';
import { WEBHOOK_EVENTS } from '../scenarios/webhooks';
import { IOT_EVENTS } from '../scenarios/iot';
import { buildButtonEvents } from '../scenarios/buttons';
import { eventDef } from '../scenarios/helpers';

function pick(scenario, id) {
  return scenario.events.find((event) => event.id === id);
}

export const FLOW_TRIGGERS = [
  { id: 'button', label: 'Button press' },
  { id: 'sensor', label: 'Sensor event' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'webhook', label: 'Webhook' },
  { id: 'mqtt', label: 'MQTT message' },
  { id: 'sip', label: 'SIP call' },
];

export const FLOW_ACTION_OPTIONS = [
  { type: 'phone', label: 'Phone call' },
  { type: 'sms', label: 'SMS' },
  { type: 'email', label: 'Email' },
  { type: 'strobe', label: 'Strobe' },
  { type: 'paging', label: 'Paging' },
  { type: 'display', label: 'Display' },
  { type: 'device', label: 'Device command' },
];

const FLOW_RESULTS = {
  phone: { label: 'Phone Call', result: 'Simulated call placed for this flow.' },
  sms: { label: 'SMS Notification', result: 'Simulated SMS sent for this flow.' },
  email: { label: 'Email Notification', result: 'Simulated email sent for this flow.' },
  strobe: { label: 'Strobe Activated', result: 'Simulated strobe activated for this flow.' },
  paging: { label: 'Paging Announcement', result: 'Simulated announcement played for this flow.' },
  display: {
    label: 'Display Message',
    result: 'Simulated display updated for this flow.',
    displayText: 'FLOW\nRUNNING',
  },
  device: { label: 'Device Command', result: 'Simulated device command acknowledged.' },
};

export function buildFlowEvent(triggerId, actionTypes) {
  const trigger = FLOW_TRIGGERS.find((item) => item.id === triggerId) || FLOW_TRIGGERS[0];
  const types = actionTypes.length ? actionTypes : ['phone'];
  return eventDef({
    id: `flow-${trigger.id}`,
    label: trigger.label,
    icon: 'multi',
    accent: 'sky',
    ingressLabel: `Simulated flow · ${trigger.label}`,
    received: `${trigger.label} received`,
    conditions: `${types.length} simulated action${types.length === 1 ? '' : 's'} selected`,
    routing: 'Visitor-built flow started',
    dispatch: 'Run the selected actions',
    actionList: types.map((type) => ({ type, ...FLOW_RESULTS[type] })),
    timings: { stepMs: 640, actionStaggerMs: 380, completeHoldMs: 180 },
  });
}

export const LEARNING_MODULES = [
  {
    id: 'A',
    name: 'Buttons & Actions',
    description: 'Simple events. Real results.',
    title: 'Buttons & Actions',
    lede: 'Press a button and watch the one action it starts.',
    body: 'Call for help, message someone, email someone, or notify someone. Each button does one thing. Flows come in a later module.',
    takeaway: '',
    kind: 'buttons',
    simulated: false,
  },
  {
    id: 'B',
    name: 'External Events & Sensors',
    description: 'Real-world device events.',
    title: 'External Events & Sensors',
    lede: 'A sensor can start the same kind of response as a button.',
    body: 'Water, door, motion, and temperature sensors show how an external signal becomes calls, messages, and device actions.',
    tileEvents: true,
    takeaway: 'The event source can change without changing the way Signal Bridge runs the response.',
    kind: 'events',
    simulated: true,
    simulationNote: 'These sensor events are simulated and are not connected to live devices.',
    events: SENSORS_SCENARIO.events,
  },
  {
    id: 'C',
    name: 'Scheduled & Automated',
    description: 'Time-based events.',
    title: 'Scheduled & Automated',
    lede: 'Bells, announcements, and notices can run without someone pressing a button.',
    body: 'These examples reuse the education demonstrations: a bell schedule, morning announcement, closure notice, emergency notification, and staff message.',
    takeaway: 'A schedule is just another event. Once it fires, the flow and actions work the same way.',
    kind: 'events',
    simulated: true,
    simulationNote: 'Schedules are simulated. Nothing is sent on a clock or to a live campus.',
    events: EDUCATION_SCENARIO.events,
  },
  {
    id: 'D',
    name: 'Algo Devices',
    description: 'Visuals, audio and alerts.',
    title: 'Algo Devices',
    lede: 'See how a flow can light a strobe, update a display, and play audio.',
    body: 'Algo strobes, displays, and speakers are shown here as a simulation so you can watch the outcomes without touching a live device.',
    takeaway: 'One event can drive visual and audio devices together.',
    kind: 'events',
    simulated: true,
    simulationNote: 'Algo device actions are simulated. This demo is not connected to Algo hardware.',
    events: ALGO_EVENTS,
  },
  {
    id: 'E',
    name: 'SIP Communications',
    description: 'Calls, paging and intercom.',
    title: 'SIP Communications',
    lede: 'Voice, paging, and intercom are different ways to reach people in the moment.',
    body: 'Place a simulated call, page a speaker zone, or open an intercom path. No SIP server or phone number is dialed.',
    takeaway: 'A voice event can stand alone or run beside a page.',
    kind: 'events',
    simulated: true,
    simulationNote: 'SIP calls, paging, and intercom are simulated. No call is placed.',
    events: SIP_EVENTS,
  },
  {
    id: 'F',
    name: 'Email, SMS & Notifications',
    description: 'Keep the right people informed.',
    title: 'Email, SMS & Notifications',
    lede: 'Written notices can travel with voice when a situation needs both.',
    body: 'Send a simulated email, notify staff, or run a closure notice across email, SMS, and phone.',
    takeaway: 'Choose the channel that fits the audience. One flow can use more than one.',
    kind: 'events',
    simulated: true,
    simulationNote: 'Email, SMS, and voice notices are simulated. No message is delivered.',
    events: [
      pick(EXPLORE_SCENARIO, 'send-email'),
      pick(EDUCATION_SCENARIO, 'staff-announcement'),
      pick(EDUCATION_SCENARIO, 'snow-day'),
    ],
  },
  {
    id: 'G',
    name: 'Webhooks & Integrations',
    description: 'Connect your existing systems.',
    title: 'Webhooks & Integrations',
    lede: 'Another system can start a Signal Bridge flow by sending an event.',
    body: 'These webhooks are acted out in the browser. Nothing is listening for a live HTTP callback.',
    takeaway: 'An integration is another way to start the same event, flow, and action path.',
    kind: 'events',
    simulated: true,
    simulationNote: 'Inbound webhooks are simulated. No external system is connected.',
    events: WEBHOOK_EVENTS,
  },
  {
    id: 'H',
    name: 'IoT Devices',
    description: 'Shelly, Bluetooth, MQTT and more.',
    title: 'IoT Devices',
    lede: 'Shelly inputs, Bluetooth presence, MQTT messages, and gateways can all start a flow.',
    body: 'Watch a Shelly contact, a Bluetooth tag, an MQTT alert, and a gateway heartbeat as simulated IoT events. Each one stays in the browser.',
    takeaway: 'Practical IoT devices become events. Signal Bridge still decides who to notify and what to activate.',
    kind: 'events',
    simulated: true,
    simulationNote:
      'Shelly, Bluetooth, MQTT, and gateway activity is simulated. Nothing is connected to live hardware.',
    events: IOT_EVENTS,
  },
  {
    id: 'I',
    name: 'Flows',
    description: 'Bring everything together.',
    title: 'Flows',
    lede: 'Combine a trigger and the actions you want to see.',
    body: 'Pick a simulated trigger, choose the outcomes, and run the flow. This builder does not save anything to a live Signal Bridge system.',
    takeaway: 'A flow is the path from one event to the actions that should follow it.',
    kind: 'composer',
    simulated: true,
    simulationNote: 'Flows you build here are simulated and are not stored or sent.',
  },
];

export function getModule(id) {
  return LEARNING_MODULES.find((module) => module.id === id) || LEARNING_MODULES[0];
}

export function eventsForModule(module, scenarioId) {
  if (module.kind === 'buttons') return buildButtonEvents(scenarioId);
  if (module.kind === 'composer') return [];
  return module.events || [];
}
