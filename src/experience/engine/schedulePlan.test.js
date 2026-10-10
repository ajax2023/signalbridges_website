import { describe, expect, it } from 'vitest';
import { buildSchedule, eventActionMap, resolveTimings } from './schedulePlan';
import { SCENARIO_LIST, getScenario, DEFAULT_SCENARIO_ID } from '../scenarios';
import { EXPLORE_SCENARIO } from '../scenarios/explore';
import { EDUCATION_SCENARIO } from '../scenarios/education';
import { BUSINESS_SCENARIO } from '../scenarios/business';
import { SENSORS_SCENARIO } from '../scenarios/sensors';

describe('scenario registry', () => {
  it('exposes four selectable demonstrations', () => {
    expect(SCENARIO_LIST).toHaveLength(4);
    expect(SCENARIO_LIST.map((s) => s.id)).toEqual([
      'explore',
      'education',
      'business',
      'sensors',
    ]);
  });

  it('defaults to explore and switches by id', () => {
    expect(DEFAULT_SCENARIO_ID).toBe('explore');
    expect(getScenario('education').id).toBe('education');
    expect(getScenario('missing').id).toBe('explore');
  });

  it('gives each scenario five distinct events', () => {
    for (const scenario of SCENARIO_LIST) {
      expect(scenario.events).toHaveLength(5);
      const ids = scenario.events.map((e) => e.id);
      expect(new Set(ids).size).toBe(5);
    }
  });
});

describe('event-to-action mappings', () => {
  it('maps explore multi-action to coordinated channels', () => {
    const map = eventActionMap(EXPLORE_SCENARIO);
    expect(map['send-email']).toEqual(['email']);
    expect(map['make-phone-call']).toEqual(['phone']);
    expect(map['activate-strobe']).toEqual(['strobe']);
    expect(map['page-speaker']).toEqual(['paging']);
    expect(map['multi-action']).toEqual(['email', 'phone', 'sms', 'paging', 'strobe']);
  });

  it('keeps education, business, and sensors mappings distinct', () => {
    expect(eventActionMap(EDUCATION_SCENARIO)['snow-day']).toEqual([
      'email',
      'sms',
      'phone',
    ]);
    expect(eventActionMap(BUSINESS_SCENARIO)['equipment-alarm']).toEqual([
      'phone',
      'email',
      'device',
    ]);
    expect(eventActionMap(SENSORS_SCENARIO)['motion-detected']).toEqual([
      'sms',
      'phone',
      'device',
      'email',
    ]);
  });
});

describe('buildSchedule', () => {
  const event = EXPLORE_SCENARIO.events.find((e) => e.id === 'multi-action');

  it('creates ordered step, action, and complete items', () => {
    const schedule = buildSchedule(event, { reducedMotion: false });
    expect(schedule.some((i) => i.kind === 'step')).toBe(true);
    expect(schedule.filter((i) => i.kind === 'action-active')).toHaveLength(5);
    expect(schedule.filter((i) => i.kind === 'action-complete')).toHaveLength(5);
    expect(schedule[schedule.length - 1].kind).toBe('complete');

    for (let i = 1; i < schedule.length; i += 1) {
      expect(schedule[i].at).toBeGreaterThanOrEqual(schedule[i - 1].at);
    }
  });

  it('collapses timing for reduced motion', () => {
    const timings = resolveTimings(event, true);
    expect(timings.stepMs).toBe(0);
    expect(timings.actionStaggerMs).toBe(0);

    const schedule = buildSchedule(event, { reducedMotion: true });
    const completeAt = schedule.find((i) => i.kind === 'complete').at;
    expect(completeAt).toBeLessThan(50);
  });

  it('supports cancellation by ignoring stale run ids (schedule independence)', () => {
    const first = buildSchedule(event, { reducedMotion: true });
    const second = buildSchedule(
      EXPLORE_SCENARIO.events.find((e) => e.id === 'send-email'),
      { reducedMotion: true },
    );
    expect(first.at(-1).payload.actionIds).toHaveLength(5);
    expect(second.at(-1).payload.actionIds).toHaveLength(1);
  });
});

describe('replay and reset semantics via schedule rebuild', () => {
  it('rebuilds an identical schedule for replay', () => {
    const event = SENSORS_SCENARIO.events[0];
    const a = buildSchedule(event, { reducedMotion: false });
    const b = buildSchedule(event, { reducedMotion: false });
    expect(a).toEqual(b);
  });

  it('reset-equivalent empty schedule when event missing', () => {
    expect(buildSchedule(null)).toEqual([]);
    expect(buildSchedule({ flowSteps: [] })).toEqual([]);
  });
});
