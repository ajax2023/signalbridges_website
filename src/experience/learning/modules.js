import { EDUCATION_SCENARIO } from '../scenarios/education';
import { EXPLORE_SCENARIO } from '../scenarios/explore';
import { SENSORS_SCENARIO } from '../scenarios/sensors';
import { ALGO_EVENTS } from '../scenarios/algo';
import { SIP_EVENTS } from '../scenarios/sip';
import { WEBHOOK_EVENTS } from '../scenarios/webhooks';
import { IOT_EVENTS } from '../scenarios/iot';
import { buildButtonEvents } from '../scenarios/buttons';
import { INTRO_FLOWS } from '../scenarios/introFlows';
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
  phone: { label: 'Phone Call', result: 'Call placed for this Flow.' },
  sms: { label: 'SMS Notification', result: 'SMS sent for this Flow.' },
  email: { label: 'Email Notification', result: 'Email sent for this Flow.' },
  strobe: { label: 'Strobe Activated', result: 'Strobe activated for this Flow.' },
  paging: { label: 'Paging Announcement', result: 'Announcement played for this Flow.' },
  display: {
    label: 'Display Message',
    result: 'Display updated for this Flow.',
    displayText: 'FLOW\nRUNNING',
  },
  device: { label: 'Device Command', result: 'Device command acknowledged.' },
};

export function buildFlowEvent(triggerId, actionTypes) {
  const trigger = FLOW_TRIGGERS.find((item) => item.id === triggerId) || FLOW_TRIGGERS[0];
  const types = actionTypes.length ? actionTypes : ['phone'];
  return eventDef({
    id: `flow-${trigger.id}`,
    label: trigger.label,
    icon: 'multi',
    accent: 'sky',
    ingressLabel: `Flow · ${trigger.label}`,
    received: `${trigger.label} received`,
    conditions: `${types.length} Action${types.length === 1 ? '' : 's'} selected`,
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
    description: 'One event. One action.',
    title: 'Buttons & Actions',
    lede: 'Press a button and see the action it triggers.',
    body: 'Call for help, message someone, email someone, or notify someone. Each button triggers one Action. The next module introduces Flows.',
    takeaway: '',
    kind: 'buttons',
    simulated: true,
  },
  {
    id: 'B',
    name: 'Flows',
    description: 'One event. Several steps.',
    title: 'Flows',
    lede: 'A Flow is a sequence of Actions that execute when triggered by an Event. Flows can include logic to make decisions, evaluate conditions, wait for responses, and branch into different Actions based on the results. A single Flow can coordinate notifications, phone calls, paging, devices, and other systems to automate simple tasks or complex workflows.' ,
    body: 'Choose a Flow and watch each step run in order. Waits and conditional branches can be included in Flows.',
    tileEvents: true,
    takeaway: '',
    kind: 'flows',
    simulated: true,
    simulationNote: 'The Signal Bridge Agent connects Algo devices to Signal Bridge, allowing Flows to control devices on your local network.',
    events: INTRO_FLOWS,
  },
  {
    id: 'C',
    name: 'External Events & Sensors',
    description: 'Real-world device events.',
    title: 'External Events & Sensors',
lede: 'External sensors automatically detect changes or conditions and trigger Signal Bridge Actions or Flows, such as sending alerts, activating devices, or escalating emergencies.',
body: 'Water, door, motion, and temperature sensors show how an external signal becomes calls, messages, and device Actions.',
tileEvents: true,
takeaway: 'Different sensors can trigger the same Flow, allowing Signal Bridge to respond consistently regardless of the Event source.',
    kind: 'events',
    simulated: true,
    simulationNote: 'These sensor events are simulated and are not connected to live devices.',
    events: SENSORS_SCENARIO.events,
  },
  {
    id: 'D',
    name: 'Scheduled & Automated',
    description: 'Time-based events.',
title: 'Scheduled & Automated',
lede: 'Schedule bells, announcements, notifications, and automated Actions to run at specific times or on recurring schedules—without anyone pressing a button.',
body: 'Explore how Signal Bridge automates school bells, morning announcements, closure notices, emergency notifications, and staff communications.',
tileEvents: true,
eventHint: 'Choose an event.',
takeaway: 'Scheduled Events can trigger simple Actions or complex Flows, allowing Signal Bridge to automate routine operations and time-sensitive responses.',
    kind: 'events',
    simulated: true,
    simulationNote: 'Schedules are simulated. Nothing is sent on a clock or to a live campus.',
    events: EDUCATION_SCENARIO.events,
  },
  {
    id: 'E',
    name: 'Algo Devices',
    description: 'Visuals, audio and alerts.',
title: 'Algo Devices',
lede: 'See how Signal Bridge controls Algo strobes, displays, and speakers to deliver visual alerts, paging announcements, and audible messages.',
body: 'The Signal Bridge Agent connects Algo devices to Signal Bridge, enabling Flows to control devices on your local network.',
takeaway: 'One event can coordinate multiple Algo devices, combining visual alerts, audio announcements, and display messages into a unified response.',
    kind: 'events',
    simulated: true,
    simulationNote: 'This demonstration simulates Algo device responses. In a live environment, the Signal Bridge Agent connects to and controls physical Algo devices.',
    events: ALGO_EVENTS,
  },
  {
    id: 'F',
    name: 'SIP Communications',
    description: 'Calls, paging and intercom.',
    title: 'SIP Communications',
lede: 'Signal Bridge integrates SIP voice communications, paging, and intercom systems into automated Events and Flows.',
body: 'Explore how Signal Bridge can place phone calls, page speaker zones, and connect intercoms. Its built-in SIP capabilities enable communication between users, phones, and connected devices.',
takeaway: 'SIP communications can trigger Flows or become part of a coordinated response involving calls, paging, notifications, and devices.',
kind: 'events',
simulated: true,
simulationNote: 'SIP calls, paging, and intercom are simulated. No live calls are placed.',
    events: SIP_EVENTS,
  },
  {
    id: 'G',
    name: 'Email, SMS & Notifications',
    description: 'Keep the right people informed.',
   title: 'Email, SMS & Notifications',
lede: 'Reach the right people through email, SMS, push notifications, and voice calls—all coordinated by Signal Bridge.',
body: 'Send individual messages, notify groups, or distribute organization-wide announcements such as school closures, emergencies, and staff updates.',
takeaway: 'One Flow can deliver messages across multiple channels, track responses, and escalate when acknowledgments are not received.',
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
    id: 'H',
    name: 'Webhooks & Integrations',
    description: 'Connect your existing systems.',
title: 'Webhooks & Integrations',
lede: 'Connect external applications and services to Signal Bridge using webhooks and APIs to trigger Actions and Flows automatically.',
body: 'Integrate websites, business applications, monitoring systems, and third-party services. Incoming Events can carry data that Flows use to make decisions, send notifications, and control devices.',
takeaway: 'Signal Bridge turns Events from external systems into coordinated responses, connecting applications, communications, and physical devices.',
kind: 'events',
simulated: true,
simulationNote: 'Inbound webhooks are simulated. No external system is connected.',
    events: WEBHOOK_EVENTS,
  },
  {
    id: 'I',
    name: 'IoT Devices',
    description: 'Shelly, Bluetooth, MQTT and more.',
title: 'IoT Devices',
lede: 'Connect IoT sensors, gateways, and smart devices to Signal Bridge to automate monitoring, alerts, and responses.',
body: 'Integrate Shelly devices, Bluetooth sensors, MQTT systems, and network gateways. Monitor device activity, detect changes, and use incoming data to trigger Actions or complex Flows.',
takeaway: 'Signal Bridge connects IoT devices with communications and automation, turning sensor data into intelligent, coordinated responses.',
kind: 'events',
simulated: true,
simulationNote:
  'Shelly, Bluetooth, MQTT, and gateway activity is simulated. Nothing is connected to live hardware.',
events: IOT_EVENTS,
  },
  {
    id: 'J',
    name: 'Build a Flow',
description: 'Bring everything together.',
title: 'Build a Flow',
lede: 'Bring everything together by creating your own Flow with Events, Actions, and automated responses.',
body: 'Choose an Event to trigger your Flow, select the Actions to execute, and see how Signal Bridge coordinates communications, notifications, and connected devices.',
takeaway: 'Flows are the heart of Signal Bridge, connecting Events to Actions and enabling everything from simple automation to complex, intelligent responses.',
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
