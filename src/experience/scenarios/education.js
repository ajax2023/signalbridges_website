import { eventDef } from './helpers';

export const EDUCATION_SCENARIO = {
  id: 'education',
  title: 'Education',
  shortTitle: 'Education',
  subtitle: 'Schools & campuses',
  description: 'Bells, announcements, closures, and emergency notifications.',
  theme: 'education',
  events: [
    eventDef({
      id: 'school-bell',
      label: 'School bell',
      icon: 'bell',
      accent: 'amber',
      ingressLabel: 'Schedule · Period change',
      received: 'Bell schedule trigger',
      conditions: 'School day active · Zone = campus',
      routing: 'Audio to classroom speakers',
      dispatch: 'Play bell tone',
      actionList: [
        {
          type: 'paging',
          label: 'Speaker paging',
          result: 'Period-change bell on campus speakers',
        },
        {
          type: 'device',
          label: 'Device command executed',
          result: 'Bell controller acknowledged',
        },
      ],
    }),
    eventDef({
      id: 'morning-announcement',
      label: 'Morning announcement',
      icon: 'announcement',
      accent: 'sky',
      ingressLabel: 'Office · Daily brief',
      received: 'Announcement queued',
      conditions: 'Audience = students + staff',
      routing: 'Page + email digest',
      dispatch: 'Deliver announcement',
      actionList: [
        {
          type: 'paging',
          label: 'Speaker paging',
          result: 'Live announcement on school PA',
        },
        {
          type: 'email',
          label: 'Email sent',
          result: 'Transcript emailed to staff list',
        },
      ],
    }),
    eventDef({
      id: 'snow-day',
      label: 'Snow day closure',
      icon: 'snow',
      accent: 'cyan',
      ingressLabel: 'District ops · Closure',
      received: 'Closure decision recorded',
      conditions: 'Parents + staff audiences loaded',
      routing: 'Multi-channel closure playbook',
      dispatch: 'Notify community',
      actionList: [
        {
          type: 'email',
          label: 'Email sent',
          result: 'Closure notice to parents@example.com',
        },
        {
          type: 'sms',
          label: 'SMS notification',
          result: 'SMS blast to guardian contacts',
        },
        {
          type: 'phone',
          label: 'Phone call initiated',
          result: 'Automated voice notice started',
        },
      ],
    }),
    eventDef({
      id: 'emergency-notification',
      label: 'Emergency notification',
      icon: 'emergency',
      accent: 'rose',
      ingressLabel: 'Safety · Priority alert',
      received: 'Emergency alert created',
      conditions: 'Priority = critical · All zones',
      routing: 'Override normal schedules',
      dispatch: 'Full campus response',
      actionList: [
        {
          type: 'paging',
          label: 'Speaker paging',
          result: 'Emergency message on all speakers',
        },
        {
          type: 'strobe',
          label: 'Strobe activated',
          result: 'Safety strobes flashing',
        },
        {
          type: 'sms',
          label: 'SMS notification',
          result: 'Emergency SMS to staff phones',
        },
        {
          type: 'phone',
          label: 'Phone call initiated',
          result: 'Call tree to administrators',
        },
      ],
      timings: { stepMs: 640, actionStaggerMs: 320, completeHoldMs: 180 },
    }),
    eventDef({
      id: 'staff-announcement',
      label: 'Staff announcement',
      icon: 'staff',
      accent: 'violet',
      ingressLabel: 'Admin · Staff only',
      received: 'Staff message submitted',
      conditions: 'Audience = staff · Quiet hours ok',
      routing: 'Email + staff app notify',
      dispatch: 'Notify staff',
      actionList: [
        {
          type: 'email',
          label: 'Email sent',
          result: 'Sent to staff@school.example.com',
        },
        {
          type: 'sms',
          label: 'SMS notification',
          result: 'Optional SMS to opted-in staff',
        },
      ],
    }),
  ],
};
