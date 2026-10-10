import { eventDef } from './helpers';

export const BUSINESS_SCENARIO = {
  id: 'business',
  title: 'Business',
  shortTitle: 'Business',
  subtitle: 'Operations & facilities',
  description: 'Shift changes, maintenance, alarms, and emergency response.',
  theme: 'business',
  events: [
    eventDef({
      id: 'shift-change',
      label: 'Shift change',
      icon: 'shift',
      accent: 'sky',
      ingressLabel: 'Workforce · Handoff',
      received: 'Shift change window opened',
      conditions: 'Site = Plant 2 · Crew B on duty',
      routing: 'Notify incoming / outgoing leads',
      dispatch: 'Run handoff actions',
      actionList: [
        {
          type: 'email',
          label: 'Email sent',
          result: 'Handoff summary to shift leads',
        },
        {
          type: 'paging',
          label: 'Speaker paging',
          result: 'Floor page: shift change in 5 minutes',
        },
      ],
    }),
    eventDef({
      id: 'maintenance-request',
      label: 'Maintenance request',
      icon: 'maintenance',
      accent: 'amber',
      ingressLabel: 'Facilities · Work order',
      received: 'Maintenance ticket created',
      conditions: 'Priority = medium · Zone = HVAC',
      routing: 'Assign facilities queue',
      dispatch: 'Notify technicians',
      actionList: [
        {
          type: 'email',
          label: 'Email sent',
          result: 'Work order emailed to facilities',
        },
        {
          type: 'sms',
          label: 'SMS notification',
          result: 'SMS to on-duty technician',
        },
      ],
    }),
    eventDef({
      id: 'equipment-alarm',
      label: 'Equipment alarm',
      icon: 'equipment',
      accent: 'orange',
      ingressLabel: 'SCADA bridge · Line 4',
      received: 'Equipment fault alarm',
      conditions: 'Severity high · Production impact',
      routing: 'Escalate to ops + maintenance',
      dispatch: 'Alarm response playbook',
      actionList: [
        {
          type: 'phone',
          label: 'Phone call initiated',
          result: 'Call to plant operations desk',
        },
        {
          type: 'email',
          label: 'Email sent',
          result: 'Alarm detail to engineering',
        },
        {
          type: 'device',
          label: 'Device command executed',
          result: 'Safe-state interlock requested',
        },
      ],
    }),
    eventDef({
      id: 'staff-notification',
      label: 'Staff notification',
      icon: 'staff',
      accent: 'violet',
      ingressLabel: 'HR / Ops · Broadcast',
      received: 'Staff notice composed',
      conditions: 'Audience = all employees',
      routing: 'Email primary · SMS optional',
      dispatch: 'Deliver notice',
      actionList: [
        {
          type: 'email',
          label: 'Email sent',
          result: 'Company-wide email delivered',
        },
        {
          type: 'sms',
          label: 'SMS notification',
          result: 'SMS to critical-role staff',
        },
      ],
    }),
    eventDef({
      id: 'emergency-response',
      label: 'Emergency response',
      icon: 'emergency',
      accent: 'rose',
      ingressLabel: 'Safety · Site emergency',
      received: 'Emergency response activated',
      conditions: 'Evacuate zones A–C · All hands',
      routing: 'Page, strobe, call, SMS fan-out',
      dispatch: 'Execute emergency playbook',
      actionList: [
        {
          type: 'paging',
          label: 'Speaker paging',
          result: 'Evacuation instructions on PA',
        },
        {
          type: 'strobe',
          label: 'Strobe activated',
          result: 'Emergency strobes active',
        },
        {
          type: 'phone',
          label: 'Phone call initiated',
          result: 'Call to emergency coordinator',
        },
        {
          type: 'sms',
          label: 'SMS notification',
          result: 'Emergency SMS to all staff',
        },
      ],
      timings: { stepMs: 620, actionStaggerMs: 300, completeHoldMs: 180 },
    }),
  ],
};
