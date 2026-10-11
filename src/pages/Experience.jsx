import { useEffect, useMemo, useRef, useState } from 'react';
import EventsPanel from '../experience/EventsPanel';
import FlowPanel from '../experience/FlowPanel';
import ActionsPanel from '../experience/ActionsPanel';
import ScenarioPicker from '../experience/ScenarioPicker';
import FlowComposer from '../experience/FlowComposer';
import LearningSidebar from '../experience/LearningSidebar';
import { useExperienceTimeline } from '../experience/engine/useExperienceTimeline';
import { useDemoCues } from '../experience/useDemoCues';
import {
  buildFlowEvent,
  eventsForModule,
  getModule,
} from '../experience/learning/modules';
import { useLearningProgress } from '../experience/learning/progress';
import '../experience/experience.css';

function Experience() {
  const [moduleId, setModuleId] = useState('A');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [triggerId, setTriggerId] = useState('button');
  const [actionTypes, setActionTypes] = useState(['phone', 'sms']);
  const [composerEvent, setComposerEvent] = useState(null);
  const playModuleRef = useRef('A');
  const seenRunRef = useRef(null);

  const module = getModule(moduleId);
  const { progress, recordCompletion, clearModule } = useLearningProgress();
  const { state, play, replay, reset } = useExperienceTimeline();
  const catalogEvents = useMemo(
    () => eventsForModule(module, 'basic-alert'),
    [module],
  );

  const selectedEvent =
    module.kind === 'composer'
      ? composerEvent
      : catalogEvents.find((event) => event.id === state.eventId) || null;

  const running = state.status === 'running';
  const completedEventIds = progress.modules[module.id]?.events || [];

  useDemoCues(soundOn, selectedEvent, state);

  useEffect(() => {
    setComposerEvent(null);
    reset();
  }, [moduleId, reset]);

  useEffect(() => {
    if (state.status !== 'complete' || !state.eventId) return;
    if (seenRunRef.current === state.runId) return;
    seenRunRef.current = state.runId;
    recordCompletion(playModuleRef.current, state.eventId);
  }, [state.status, state.runId, state.eventId, recordCompletion]);

  function handleSelect(eventId) {
    if (running) return;
    const event = catalogEvents.find((item) => item.id === eventId);
    if (!event) return;
    playModuleRef.current = moduleId;
    play(event);
  }

  function handleReplay() {
    if (!selectedEvent || running) return;
    playModuleRef.current = moduleId;
    replay(selectedEvent);
  }

  function handleReset() {
    setComposerEvent(null);
    clearModule(moduleId);
    reset();
  }

  function handleRunFlow() {
    if (running || actionTypes.length === 0) return;
    const event = buildFlowEvent(triggerId, actionTypes);
    playModuleRef.current = moduleId;
    setComposerEvent(event);
    play(event);
  }

  function handleToggleAction(type) {
    setActionTypes((current) => (
      current.includes(type) ? current.filter((item) => item !== type) : [...current, type]
    ));
    setComposerEvent(null);
    reset();
  }

  const statusText =
    state.status === 'running'
      ? `Running ${selectedEvent?.label || 'demonstration'}`
      : state.status === 'complete'
        ? `Completed ${selectedEvent?.label || 'demonstration'}`
        : 'Ready. Select an event.';

  return (
    <div className="sb-learn flex h-full min-h-0 overflow-hidden bg-[#f4f7fb] text-slate-900">
      <LearningSidebar
        activeId={module.id}
        progress={progress}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelect={(id) => {
          setModuleId(id);
          setSidebarOpen(false);
        }}
      />

      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
        <div className="flex w-full flex-col gap-5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <button
            type="button"
            className="inline-flex w-fit items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 xl:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            Open learning modules
          </button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-4xl">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-blue-500 text-lg font-bold text-blue-600">
                  {module.id}
                </span>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{module.title}</h1>
              </div>
              <p className="mt-3 text-base text-slate-600">{module.lede}</p>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500">{module.body}</p>
              {module.simulated && (
                <p className="mt-3 inline-flex max-w-3xl rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold leading-relaxed text-amber-800">
                  Simulation — {module.simulationNote}
                </p>
              )}
            </div>

            {module.kind === 'buttons' && (
              <button
                type="button"
                onClick={handleReset}
                disabled={state.status === 'idle' && completedEventIds.length === 0}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                Reset
              </button>
            )}
          </div>

          <div className="flex flex-col gap-4" aria-busy={running}>
            {module.kind === 'buttons' ? (
              <EventsPanel
                events={catalogEvents}
                variant="tiles"
                selectedEventId={state.eventId}
                running={running}
                completedEventIds={completedEventIds}
                onSelect={handleSelect}
              />
            ) : null}
            <div
              className={
                module.kind === 'buttons'
                  ? 'grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2 [&>*]:min-w-0'
                  : 'grid grid-cols-1 items-stretch gap-4 lg:grid-cols-3 [&>*]:min-w-0'
              }
            >
              {module.kind === 'composer' ? (
                <FlowComposer
                  triggerId={triggerId}
                  actionTypes={actionTypes}
                  running={running}
                  onTrigger={(next) => {
                    setTriggerId(next);
                    setComposerEvent(null);
                    reset();
                  }}
                  onToggleAction={handleToggleAction}
                  onRun={handleRunFlow}
                />
              ) : module.kind === 'buttons' ? null : (
                <EventsPanel
                  events={catalogEvents}
                  selectedEventId={state.eventId}
                  running={running}
                  completedEventIds={completedEventIds}
                  onSelect={handleSelect}
                />
              )}
              <FlowPanel event={selectedEvent} timeline={state} omitFlow={module.kind === 'buttons'} />
              <ActionsPanel
                event={selectedEvent}
                timeline={state}
                emptyMessage={
                  module.kind === 'buttons'
                    ? 'Press a button. Its one action shows up here, and it stays in this browser.'
                    : undefined
                }
              />
            </div>
          </div>

          {module.kind !== 'buttons' && (
            <ScenarioPicker
              title="Demonstration controls"
              description="Replay the last event, reset the stage, or turn sound on. Sound stays off until you enable it."
              scenarios={[]}
              activeId=""
              onChange={() => {}}
              onReplay={handleReplay}
              onReset={handleReset}
              canReplay={Boolean(selectedEvent) && !running}
              canReset={state.status !== 'idle'}
              soundOn={soundOn}
              onToggleSound={() => setSoundOn((value) => !value)}
            />
          )}

          <p className="text-center text-xs text-slate-500">
            Demonstration only. No calls, text messages, emails, pages, or device commands leave this browser.
          </p>
          <div role="status" className="sr-only">
            {statusText}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Experience;
