/** Presentation timeline derived from the execution engine state. */

export function bridgeView(event, timeline, { omitFlow = false } = {}) {
  const status = timeline?.status || 'idle';
  const idx = timeline?.activeStepIndex ?? -1;
  const actionCount = event?.actions?.length || 0;
  const actionsStarted = (timeline?.activeActionIds?.length || 0) > 0;
  const complete = status === 'complete';
  const hasEvent = Boolean(event);

  let received = 'idle';
  if (hasEvent && (complete || idx > 0)) received = 'done';
  else if (hasEvent && idx === 0) received = 'active';

  let flow = 'idle';
  if (hasEvent && (complete || idx >= 3 || actionsStarted)) flow = 'done';
  else if (hasEvent && idx >= 1) flow = 'active';

  let executing = 'idle';
  if (hasEvent && complete) executing = 'done';
  else if (hasEvent && (actionsStarted || idx >= 3)) executing = 'active';

  const actionWord = `Running ${actionCount} action${actionCount === 1 ? '' : 's'}`;
  const singleAction = event?.actions?.length === 1 ? event.actions[0].label : null;

  const steps = [
    {
      id: 'received',
      label: 'Event received',
      detail: received === 'idle' ? 'Waiting for an event' : event.flowSteps?.[0]?.detail || 'Event detected',
      state: received,
    },
    {
      id: 'flow',
      label: 'Flow started',
      detail: flow === 'idle' ? 'Waiting' : actionWord,
      state: flow,
    },
    {
      id: 'executing',
      label: singleAction ? 'Action running' : 'Actions executing',
      detail: executing === 'idle' ? 'Waiting' : singleAction || 'Calling, notifying, activating devices',
      state: executing,
    },
    {
      id: 'completed',
      label: 'Completed',
      detail: complete
        ? `Simulated action${actionCount === 1 ? '' : 's'} finished`
        : 'Waiting',
      state: complete ? 'done' : 'idle',
    },
  ];

  return omitFlow ? steps.filter((step) => step.id !== 'flow') : steps;
}
