/** Shared helpers for scenario configuration. */

export function flow(steps) {
  return steps.map((s) => ({
    id: s.id,
    label: s.label,
    detail: s.detail,
  }));
}

export const STANDARD_FLOW = {
  received: (detail) => ({ id: 'received', label: 'Event received', detail }),
  conditions: (detail) => ({ id: 'conditions', label: 'Conditions evaluated', detail }),
  routing: (detail) => ({ id: 'routing', label: 'Decision / routing', detail }),
  dispatch: (detail) => ({ id: 'dispatch', label: 'Actions dispatched', detail }),
};

export function actions(list) {
  return list.map((a, index) => ({
    id: a.id || `${a.type}-${index}`,
    type: a.type,
    label: a.label,
    result: a.result,
  }));
}

export function eventDef({
  id,
  label,
  icon,
  accent,
  ingressLabel,
  received,
  conditions,
  routing,
  dispatch,
  actionList,
  timings,
}) {
  return {
    id,
    label,
    icon,
    accent,
    ingressLabel,
    flowSteps: flow([
      STANDARD_FLOW.received(received),
      STANDARD_FLOW.conditions(conditions),
      STANDARD_FLOW.routing(routing),
      STANDARD_FLOW.dispatch(dispatch),
    ]),
    actions: actions(actionList),
    timings: timings || { stepMs: 680, actionStaggerMs: 380, completeHoldMs: 180 },
  };
}
