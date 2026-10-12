import { describe, expect, it } from 'vitest';
import { LEARNING_MODULES } from './modules';
import { buildButtonEvents } from '../scenarios/buttons';
import {
  addCompletion,
  completedCount,
  emptyProgress,
  isModuleComplete,
} from './progress';

describe('learning progress', () => {
  it('does not treat a module as complete until an interaction finishes', () => {
    const progress = emptyProgress();
    expect(isModuleComplete(progress, 'A')).toBe(false);
    expect(completedCount(progress, LEARNING_MODULES.map((module) => module.id))).toBe(0);
  });

  it('records a finished interaction once and counts that module', () => {
    const once = addCompletion(emptyProgress(), 'A', 'emergency');
    const twice = addCompletion(once, 'A', 'emergency');
    expect(twice).toBe(once);
    expect(isModuleComplete(once, 'A')).toBe(true);
    expect(isModuleComplete(once, 'B')).toBe(false);
    expect(completedCount(once, ['A', 'B', 'C'])).toBe(1);
  });
});

describe('learning modules', () => {
  it('lists ten modules from buttons through the flow builder', () => {
    expect(LEARNING_MODULES.map((module) => module.id)).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']);
    expect(LEARNING_MODULES.find((module) => module.id === 'B').name).toBe('Flows');
    expect(LEARNING_MODULES.find((module) => module.id === 'C').name).toBe('External Events & Sensors');
    expect(LEARNING_MODULES.find((module) => module.id === 'J').kind).toBe('composer');
  });

  it('introduces four example flows before the sensor module', () => {
    const flows = LEARNING_MODULES.find((module) => module.id === 'B');
    expect(flows.events.map((event) => event.label)).toEqual([
      'Water Leak Response',
      'Emergency Response',
      'Equipment Failure Monitoring',
      'School Lockdown',
    ]);
    expect(flows.events.map((event) => event.lessonSteps)).toEqual([
      [
        'Send SMS to maintenance',
        'Wait 2 minutes for acknowledgment',
        'If none, call supervisor',
        'Activate strobe',
      ],
      [
        'Activate SIP paging',
        'Flash strobes',
        'Notify staff',
        'Wait for acknowledgment',
        'If none, call security',
      ],
      [
        'Send temperature warning',
        'Wait and recheck temperature',
        'Notify technician',
        'If unresolved, escalate to maintenance supervisor',
      ],
      [
        'Activate emergency paging',
        'Flash strobes',
        'Send staff notifications',
        'Collect acknowledgments',
        'Wait for authorized All-Clear',
        'Announce All-Clear',
        'Update Algo displays',
      ],
    ]);
    expect(flows.events[0].actions.map((action) => action.type)).toEqual(['sms', 'wait', 'phone', 'strobe']);
    expect(flows.events[3].actions.map((action) => action.type)).toEqual([
      'paging',
      'strobe',
      'notification',
      'wait',
      'wait',
      'paging',
      'display',
    ]);
  });

  it('keeps module I on practical IoT integrations', () => {
    const iot = LEARNING_MODULES.find((module) => module.id === 'I');
    const blob = JSON.stringify(iot);
    expect(blob).toMatch(/Shelly/);
    expect(blob).toMatch(/Bluetooth/);
    expect(blob).toMatch(/MQTT/);
    expect(blob).toMatch(/[Gg]ateway/);
    expect(blob).not.toMatch(/Sidewalk/i);
    expect(blob).not.toMatch(/Ring sensor|Amazon Ring/i);
  });

  it('gives each demo button a single action', () => {
    const events = buildButtonEvents();
    expect(events.map((event) => event.id)).toEqual([
      'call-help',
      'message-someone',
      'email-someone',
      'notify-someone',
    ]);
    expect(events.map((event) => event.actions.map((action) => action.type))).toEqual([
      ['phone'],
      ['sms'],
      ['email'],
      ['notification'],
    ]);
  });
});
