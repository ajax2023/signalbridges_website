import { useCallback, useEffect, useRef, useState } from 'react';
import { buildSchedule } from './schedulePlan';

function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export const IDLE_STATE = {
  status: 'idle',
  eventId: null,
  activeStepIndex: -1,
  completedStepIds: [],
  activeActionIds: [],
  completedActionIds: [],
  runId: 0,
};

/**
 * Deterministic, cancellable timeline for a scenario event.
 * Simulation only — no network side effects.
 */
export function useExperienceTimeline() {
  const [state, setState] = useState(IDLE_STATE);
  const timersRef = useRef([]);
  const runIdRef = useRef(0);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const cancel = useCallback(() => {
    clearTimers();
    runIdRef.current += 1;
  }, [clearTimers]);

  const reset = useCallback(() => {
    cancel();
    setState({ ...IDLE_STATE, runId: runIdRef.current });
  }, [cancel]);

  const play = useCallback(
    (event) => {
      if (!event) return;
      clearTimers();
      runIdRef.current += 1;
      const runId = runIdRef.current;
      const reduced = prefersReducedMotion();
      const schedule = buildSchedule(event, { reducedMotion: reduced });

      setState({
        status: 'running',
        eventId: event.id,
        activeStepIndex: -1,
        completedStepIds: [],
        activeActionIds: [],
        completedActionIds: [],
        runId,
      });

      schedule.forEach((item) => {
        const timerId = window.setTimeout(() => {
          if (runIdRef.current !== runId) return;

          if (item.kind === 'step') {
            const { index } = item.payload;
            setState((prev) => {
              const priorId = index > 0 ? event.flowSteps[index - 1]?.id : null;
              const completed =
                priorId == null
                  ? prev.completedStepIds
                  : Array.from(new Set([...prev.completedStepIds, priorId]));
              return {
                ...prev,
                status: 'running',
                eventId: event.id,
                activeStepIndex: index,
                completedStepIds: completed,
              };
            });
          }

          if (item.kind === 'action-active') {
            setState((prev) => ({
              ...prev,
              activeActionIds: Array.from(
                new Set([...prev.activeActionIds, item.payload.actionId]),
              ),
            }));
          }

          if (item.kind === 'action-complete') {
            setState((prev) => ({
              ...prev,
              completedActionIds: Array.from(
                new Set([...prev.completedActionIds, item.payload.actionId]),
              ),
            }));
          }

          if (item.kind === 'complete') {
            setState((prev) => ({
              ...prev,
              status: 'complete',
              activeStepIndex: item.payload.lastStepIndex,
              completedStepIds: item.payload.stepIds,
              activeActionIds: item.payload.actionIds,
              completedActionIds: item.payload.actionIds,
            }));
          }
        }, item.at);
        timersRef.current.push(timerId);
      });
    },
    [clearTimers],
  );

  const replay = useCallback(
    (event) => {
      if (!event) return;
      play(event);
    },
    [play],
  );

  useEffect(() => () => clearTimers(), [clearTimers]);

  return { state, play, replay, reset, cancel };
}
