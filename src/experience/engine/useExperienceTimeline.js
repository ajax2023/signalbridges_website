import { useCallback, useEffect, useRef, useState } from 'react';

function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const IDLE = {
  status: 'idle',
  eventId: null,
  activeStepIndex: -1,
  completedStepIds: [],
  activeActionIds: [],
  completedActionIds: [],
  runId: 0,
};

/**
 * Deterministic, replayable timeline for a scenario event.
 * No network side effects — simulation only.
 */
export function useExperienceTimeline() {
  const [state, setState] = useState(IDLE);
  const timersRef = useRef([]);
  const runIdRef = useRef(0);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const reset = useCallback(() => {
    clearTimers();
    runIdRef.current += 1;
    setState({ ...IDLE, runId: runIdRef.current });
  }, [clearTimers]);

  const schedule = useCallback((fn, ms) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  const play = useCallback(
    (event) => {
      if (!event) return;
      clearTimers();
      runIdRef.current += 1;
      const runId = runIdRef.current;
      const reduced = prefersReducedMotion();
      const stepMs = reduced ? 0 : event.timings?.stepMs ?? 700;
      const actionStaggerMs = reduced ? 0 : event.timings?.actionStaggerMs ?? 400;
      const completeHoldMs = reduced ? 0 : event.timings?.completeHoldMs ?? 200;

      setState({
        status: 'running',
        eventId: event.id,
        activeStepIndex: -1,
        completedStepIds: [],
        activeActionIds: [],
        completedActionIds: [],
        runId,
      });

      let cursor = reduced ? 40 : 180;

      event.flowSteps.forEach((step, index) => {
        const at = cursor;
        schedule(() => {
          if (runIdRef.current !== runId) return;
          setState((prev) => ({
            ...prev,
            status: 'running',
            activeStepIndex: index,
            completedStepIds:
              index === 0
                ? prev.completedStepIds
                : Array.from(new Set([...prev.completedStepIds, event.flowSteps[index - 1].id])),
          }));
        }, at);
        cursor += stepMs;

        // When dispatch step becomes active, stagger actions
        if (step.id === 'dispatch') {
          event.actions.forEach((action, actionIndex) => {
            const actionAt = at + (reduced ? 0 : 120) + actionIndex * actionStaggerMs;
            schedule(() => {
              if (runIdRef.current !== runId) return;
              setState((prev) => ({
                ...prev,
                activeActionIds: Array.from(new Set([...prev.activeActionIds, action.id])),
              }));
            }, actionAt);
            schedule(() => {
              if (runIdRef.current !== runId) return;
              setState((prev) => ({
                ...prev,
                completedActionIds: Array.from(new Set([...prev.completedActionIds, action.id])),
              }));
            }, actionAt + (reduced ? 0 : Math.max(220, actionStaggerMs * 0.75)));
          });
          cursor = Math.max(
            cursor,
            at + (reduced ? 0 : 120) + event.actions.length * actionStaggerMs + 280,
          );
        }
      });

      schedule(() => {
        if (runIdRef.current !== runId) return;
        setState((prev) => ({
          ...prev,
          status: 'complete',
          activeStepIndex: event.flowSteps.length - 1,
          completedStepIds: event.flowSteps.map((s) => s.id),
          activeActionIds: event.actions.map((a) => a.id),
          completedActionIds: event.actions.map((a) => a.id),
        }));
      }, cursor + completeHoldMs);
    },
    [clearTimers, schedule],
  );

  const replay = useCallback(
    (event) => {
      if (!event) return;
      play(event);
    },
    [play],
  );

  useEffect(() => () => clearTimers(), [clearTimers]);

  return { state, play, replay, reset };
}
