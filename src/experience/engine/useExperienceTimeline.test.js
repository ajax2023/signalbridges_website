import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useExperienceTimeline } from './useExperienceTimeline';
import { EXPLORE_SCENARIO } from '../scenarios/explore';

describe('useExperienceTimeline', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('plays an event through to complete', () => {
    const event = EXPLORE_SCENARIO.events.find((e) => e.id === 'send-email');
    const { result } = renderHook(() => useExperienceTimeline());

    act(() => {
      result.current.play(event);
    });
    expect(result.current.state.status).toBe('running');
    expect(result.current.state.eventId).toBe('send-email');

    act(() => {
      vi.runAllTimers();
    });

    expect(result.current.state.status).toBe('complete');
    expect(result.current.state.completedActionIds.length).toBe(1);
  });

  it('resets to idle and cancels pending timers', () => {
    const event = EXPLORE_SCENARIO.events.find((e) => e.id === 'multi-action');
    const { result } = renderHook(() => useExperienceTimeline());

    act(() => {
      result.current.play(event);
    });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current.state.status).toBe('running');

    act(() => {
      result.current.reset();
    });
    expect(result.current.state.status).toBe('idle');
    expect(result.current.state.eventId).toBe(null);

    act(() => {
      vi.runAllTimers();
    });
    expect(result.current.state.status).toBe('idle');
  });

  it('replays the same event after completion', () => {
    const event = EXPLORE_SCENARIO.events.find((e) => e.id === 'page-speaker');
    const { result } = renderHook(() => useExperienceTimeline());

    act(() => {
      result.current.play(event);
      vi.runAllTimers();
    });
    expect(result.current.state.status).toBe('complete');

    act(() => {
      result.current.replay(event);
    });
    expect(result.current.state.status).toBe('running');

    act(() => {
      vi.runAllTimers();
    });
    expect(result.current.state.status).toBe('complete');
  });

  it('cancels an in-flight run when a new play starts', () => {
    const first = EXPLORE_SCENARIO.events.find((e) => e.id === 'multi-action');
    const second = EXPLORE_SCENARIO.events.find((e) => e.id === 'send-email');
    const { result } = renderHook(() => useExperienceTimeline());

    act(() => {
      result.current.play(first);
      vi.advanceTimersByTime(100);
      result.current.play(second);
      vi.runAllTimers();
    });

    expect(result.current.state.eventId).toBe('send-email');
    expect(result.current.state.status).toBe('complete');
    expect(result.current.state.completedActionIds).toHaveLength(1);
  });

  it('honors reduced motion by completing quickly', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query) => ({
        matches: String(query).includes('prefers-reduced-motion'),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );

    const event = EXPLORE_SCENARIO.events.find((e) => e.id === 'activate-strobe');
    const { result } = renderHook(() => useExperienceTimeline());

    act(() => {
      result.current.play(event);
      vi.advanceTimersByTime(10);
      vi.runAllTimers();
    });

    expect(result.current.state.status).toBe('complete');
  });
});
