import { eventDef } from './helpers';

/**
 * Practical IoT simulations: Shelly inputs, Bluetooth presence,
 * MQTT messages, and a site gateway. Not connected to live hardware.
 */
export const IOT_EVENTS = [
  eventDef({
    id: 'shelly-input',
    label: 'Shelly input',
    icon: 'device',
    accent: 'amber',
    ingressLabel: 'Shelly relay input',
    received: 'Shelly dry-contact input closed',
    conditions: 'Input mapped · Debounce passed',
    routing: 'Start the Shelly response flow',
    dispatch: 'Notify staff and pulse the relay',
    actionList: [
      { type: 'sms', label: 'SMS Notification', result: 'SMS: Shelly input closed at the equipment room.' },
      { type: 'device', label: 'Device Command', result: 'Shelly relay pulse acknowledged.' },
    ],
  }),
  eventDef({
    id: 'bluetooth-presence',
    label: 'Bluetooth presence',
    icon: 'motion',
    accent: 'sky',
    ingressLabel: 'Bluetooth gateway',
    received: 'Known Bluetooth tag entered the lobby zone',
    conditions: 'Tag id recognized · Zone = lobby',
    routing: 'Presence flow for staff arrival',
    dispatch: 'Send a presence notice',
    actionList: [
      { type: 'sms', label: 'SMS Notification', result: 'SMS: Bluetooth tag detected in the lobby.' },
      { type: 'display', label: 'Display Message', result: 'Lobby sign updated.', displayText: 'WELCOME\nLOBBY CHECK-IN' },
    ],
  }),
  eventDef({
    id: 'mqtt-message',
    label: 'MQTT message',
    icon: 'equipment',
    accent: 'cyan',
    ingressLabel: 'MQTT broker',
    received: 'Message on site/alerts/mqtt',
    conditions: 'Topic allowed · Payload parsed',
    routing: 'MQTT rule matched an alert flow',
    dispatch: 'Email facilities and command the device',
    actionList: [
      { type: 'email', label: 'Email Notification', result: 'Email created from the MQTT alert topic.' },
      { type: 'device', label: 'Device Command', result: 'Command published back to the MQTT device topic.' },
    ],
  }),
  eventDef({
    id: 'gateway-offline',
    label: 'Gateway offline',
    icon: 'offline',
    accent: 'rose',
    ingressLabel: 'IoT gateway',
    received: 'Gateway heartbeat missed',
    conditions: 'Missed three check-ins · Site still reachable',
    routing: 'Gateway health flow',
    dispatch: 'Call and email the site contact',
    actionList: [
      { type: 'phone', label: 'Phone Call', result: 'Call placed: IoT gateway is offline.' },
      { type: 'email', label: 'Email Notification', result: 'Email sent to the gateway owner.' },
    ],
  }),
];
