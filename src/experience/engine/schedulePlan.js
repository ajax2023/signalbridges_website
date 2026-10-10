/**
 * Pure schedule builder for deterministic experience simulations.
 * No timers or DOM — safe for unit tests.
 */

export function resolveTimings(event, reducedMotion) {
  if (reducedMotion) {
    return { stepMs: 0, actionStaggerMs: 0, completeHoldMs: 0, startDelayMs: 0, actionLeadMs: 0 };
  }
  return {
    stepMs: event.timings?.stepMs ?? 700,
    actionStaggerMs: event.timings?.actionStaggerMs ?? 400,
    completeHoldMs: event.timings?.completeHoldMs ?? 200,
    startDelayMs: 180,
    actionLeadMs: 120,
  };
}

/**
 * Build an ordered list of timeline events for one scenario event.
 * @returns {{ at: number, kind: string, payload: object }[]}
 */
export function buildSchedule(event, { reducedMotion = false } = {}) {
  if (!event?.flowSteps?.length) return [];

  const { stepMs, actionStaggerMs, completeHoldMs, startDelayMs, actionLeadMs } =
    resolveTimings(event, reducedMotion);

  const items = [];
  let cursor = startDelayMs;

  event.flowSteps.forEach((step, index) => {
    const at = cursor;
    items.push({
      at,
      kind: 'step',
      payload: { index, stepId: step.id },
    });
    cursor += stepMs;

    if (step.id === 'dispatch' && Array.isArray(event.actions)) {
      event.actions.forEach((action, actionIndex) => {
        const actionAt = at + actionLeadMs + actionIndex * actionStaggerMs;
        items.push({
          at: actionAt,
          kind: 'action-active',
          payload: { actionId: action.id },
        });
        items.push({
          at: actionAt + (reducedMotion ? 0 : Math.max(220, actionStaggerMs * 0.75)),
          kind: 'action-complete',
          payload: { actionId: action.id },
        });
      });
      const tailMs = reducedMotion ? 0 : 280;
      cursor = Math.max(
        cursor,
        at + actionLeadMs + event.actions.length * actionStaggerMs + tailMs,
      );
    }
  });

  items.push({
    at: cursor + completeHoldMs,
    kind: 'complete',
    payload: {
      stepIds: event.flowSteps.map((s) => s.id),
      actionIds: (event.actions || []).map((a) => a.id),
      lastStepIndex: event.flowSteps.length - 1,
    },
  });

  return items.sort((a, b) => a.at - b.at);
}

/** Map of eventId → action type ids for a scenario (test helper). */
export function eventActionMap(scenario) {
  const map = {};
  for (const event of scenario.events || []) {
    map[event.id] = (event.actions || []).map((a) => a.type);
  }
  return map;
}
