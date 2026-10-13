import { describe, expect, it } from 'vitest';
import {
  actionIconSrc,
  EVENT_IMAGE_REGISTRY,
  eventIconSrcs,
  triggerIconSrc,
} from './experienceIcons';

describe('experience image registry', () => {
  it('maps event artwork separately from action artwork', () => {
    expect(eventIconSrcs({ id: 'call-help' })[0]).toContain('Phone%20Call.png');
    expect(eventIconSrcs({ id: 'algo-combined' })).toHaveLength(2);
    expect(EVENT_IMAGE_REGISTRY['webhook-alert']).toBeUndefined();
  });

  it('uses contextual Algo artwork for actions', () => {
    expect(actionIconSrc({ type: 'strobe', imageKey: 'strobe-blue' })).toContain('8138%20BLUE.png');
    expect(actionIconSrc({ type: 'paging', imageKey: 'algo-horn' })).toContain('Horn.png');
    expect(actionIconSrc({ type: 'display', displayText: 'ALL CLEAR' })).toContain('ALL%20CLEAR.png');
  });

  it('does not invent missing trigger artwork', () => {
    expect(triggerIconSrc('sip')).toContain('Phone%20Call.png');
    expect(triggerIconSrc('webhook')).toBeNull();
  });
});
