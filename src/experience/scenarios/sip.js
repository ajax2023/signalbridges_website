import { eventDef } from './helpers';
import { EXPLORE_SCENARIO } from './explore';

const phone = EXPLORE_SCENARIO.events.find((event) => event.id === 'make-phone-call');
const page = EXPLORE_SCENARIO.events.find((event) => event.id === 'page-speaker');

const intercom = eventDef({
  id: 'sip-intercom',
  label: 'Intercom call',
  icon: 'phone',
  accent: 'violet',
  ingressLabel: 'SIP intercom',
  received: 'Intercom session requested',
  conditions: 'Station online · Zone mapped',
  routing: 'Open the talk path',
  dispatch: 'Connect call and zone page',
  actionList: [
    {
      type: 'phone',
      label: 'Phone Call',
      result: 'Intercom call connected.',
      imageKey: 'algo-doorphone',
    },
    {
      type: 'paging',
      label: 'Paging Announcement',
      result: 'Two-way page connected to the zone speaker.',
      imageKey: 'algo-horn',
    },
  ],
});

/** Reuses explore voice and paging events, plus a labelled intercom simulation. */
export const SIP_EVENTS = [phone, page, intercom];
