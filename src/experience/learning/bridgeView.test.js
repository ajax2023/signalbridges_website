import { describe, expect, it } from 'vitest';
import { bridgeView } from './bridgeView';
import { buildButtonEvents } from '../scenarios/buttons';

const event = buildButtonEvents('basic-alert').find((item) => item.id === 'emergency');

describe('bridgeView', () => {
  it('keeps every stage waiting before an event starts', () => {
    const steps = bridgeView(null, { status: 'idle', activeStepIndex: -1, activeActionIds: [] });
    expect(steps.map((step) => step.state)).toEqual(['idle', 'idle', 'idle', 'idle']);
    expect(steps.map((step) => step.label)).toEqual([
      'Event received',
      'Flow started',
      'Actions executing',
      'Completed',
    ]);
  });

  it('advances from received to flow to actions before completion', () => {
    const base = { status: 'running', activeActionIds: [] };
    expect(bridgeView(event, { ...base, activeStepIndex: 0 }).find((s) => s.id === 'received').state).toBe('active');
    expect(bridgeView(event, { ...base, activeStepIndex: 1 }).find((s) => s.id === 'flow').state).toBe('active');
    expect(bridgeView(event, { ...base, activeStepIndex: 3 }).find((s) => s.id === 'executing').state).toBe('active');
    expect(bridgeView(event, { ...base, activeStepIndex: 3 }).find((s) => s.id === 'completed').state).toBe('idle');
  });

  it('marks every stage done only when the run completes', () => {
    const steps = bridgeView(event, {
      status: 'complete',
      activeStepIndex: 3,
      activeActionIds: ['phone-0', 'strobe-1'],
    });
    expect(steps.every((step) => step.state === 'done')).toBe(true);
    expect(steps.find((step) => step.id === 'completed').detail).toMatch(/finished/i);
  });
});
