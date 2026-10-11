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
  it('lists nine modules from buttons through flows', () => {
    expect(LEARNING_MODULES.map((module) => module.id)).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']);
  });

  it('keeps module H on practical IoT integrations', () => {
    const iot = LEARNING_MODULES.find((module) => module.id === 'H');
    const blob = JSON.stringify(iot);
    expect(blob).toMatch(/Shelly/);
    expect(blob).toMatch(/Bluetooth/);
    expect(blob).toMatch(/MQTT/);
    expect(blob).toMatch(/[Gg]ateway/);
    expect(blob).not.toMatch(/Sidewalk/i);
    expect(blob).not.toMatch(/Ring sensor|Amazon Ring/i);
  });

  it('gives each button scenario a different action set', () => {
    const types = (id) => buildButtonEvents(id).find((event) => event.id === 'emergency').actions.map((action) => action.type);
    expect(types('basic-alert')).toEqual(['phone', 'strobe']);
    expect(types('multi-channel')).toEqual(['phone', 'sms', 'display']);
    expect(types('paging')).toEqual(['paging']);
    expect(types('custom-flow')).toEqual(['phone', 'sms', 'email', 'strobe', 'display', 'paging']);
  });
});
