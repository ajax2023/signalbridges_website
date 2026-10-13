import { useEffect, useMemo, useRef, useState } from 'react';
import EventsPanel from '../experience/EventsPanel';
import FlowPanel from '../experience/FlowPanel';
import ActionsPanel from '../experience/ActionsPanel';
import FlowComposer from '../experience/FlowComposer';
import LearningSidebar from '../experience/LearningSidebar';
import { useExperienceTimeline } from '../experience/engine/useExperienceTimeline';
import {
  buildFlowEvent,
  eventsForModule,
  getModule,
  LEARNING_MODULES,
} from '../experience/learning/modules';
import { useLearningProgress } from '../experience/learning/progress';
import '../experience/experience.css';

function Experience() {
  const [moduleId, setModuleId] = useState('A');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [triggerId, setTriggerId] = useState('button');
  const [actionTypes, setActionTypes] = useState(['phone', 'sms']);
  const [composerEvent, setComposerEvent] = useState(null);
  const playModuleRef = useRef('A');
  const seenRunRef = useRef(null);
  const contentScrollRef = useRef(null);

  const module = getModule(moduleId);
  const moduleIndex = LEARNING_MODULES.findIndex((item) => item.id === module.id);
  const nextModule = LEARNING_MODULES[moduleIndex + 1] || null;
  const { progress, recordCompletion, clearAll } = useLearningProgress();
  const { state, play, reset } = useExperienceTimeline();
  const catalogEvents = useMemo(
    () => eventsForModule(module, 'basic-alert'),
    [module],
  );

  const selectedEvent =
    module.kind === 'composer'
      ? composerEvent
      : catalogEvents.find((event) => event.id === state.eventId) || null;

  const running = state.status === 'running';
  const hasCompletedCurrentRun =
    state.status === 'complete' && playModuleRef.current === module.id;
  const completedEventIds = progress.modules[module.id]?.events || [];
  const hasAnyCompletion = Object.values(progress.modules).some((entry) => (entry?.events || []).length > 0);
  const canReset = state.status !== 'idle' || hasAnyCompletion;

  useEffect(() => {
    setComposerEvent(null);
    reset();
    if (contentScrollRef.current) contentScrollRef.current.scrollTop = 0;
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

  function handleReset() {
    setComposerEvent(null);
    clearAll();
    reset();
  }

  function handleModuleSelect(id) {
    setModuleId(id);
    setSidebarOpen(false);
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
        onSelect={handleModuleSelect}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div ref={contentScrollRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex w-full flex-col gap-5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <button
            type="button"
            className="inline-flex w-fit items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 xl:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            Open learning modules
          </button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-blue-500 text-lg font-bold text-blue-600">
                  {module.id}
                </span>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{module.title}</h1>
              </div>
              <div className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm">
                <p className="text-base leading-relaxed text-slate-700">{module.lede}</p>
              </div>
              <p className="mt-2 w-full text-sm leading-relaxed text-slate-500">{module.body}</p>
            </div>

            <button
              type="button"
              onClick={handleReset}
              disabled={!canReset}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Reset
            </button>
          </div>

          <div
            className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-3 [&>*]:min-w-0"
            aria-busy={running}
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
            ) : (
              <EventsPanel
                events={catalogEvents}
                variant={module.kind === 'buttons' || module.tileEvents ? 'tiles' : 'list'}
                hint={module.eventHint || (module.kind === 'flows' ? 'Choose a flow.' : undefined)}
                selectedEventId={state.eventId}
                running={running}
                completedEventIds={completedEventIds}
                onSelect={handleSelect}
              />
            )}
            <FlowPanel
              event={selectedEvent}
              timeline={state}
              omitFlow={module.kind === 'buttons'}
              lesson={module.kind === 'flows'}
            />
            <ActionsPanel
              event={selectedEvent}
              timeline={state}
              stagger={module.kind === 'flows'}
              emptyMessage={
                module.kind === 'buttons'
                  ? 'Press a button to see its Action appear here.'
                  : module.kind === 'flows'
                    ? 'Choose a Flow to see its Actions appear here in sequence.'
                    : undefined
              }
            />
          </div>

          {hasCompletedCurrentRun && (
            <section
              aria-label="Module complete"
              className="flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                  Demonstration complete
                </p>
                {nextModule ? (
                  <p className="mt-1 max-w-4xl text-sm leading-relaxed text-slate-700">
                    {module.takeaway ||
                      'Continue to the next demonstration to build on the Event → Flow → Action model.'}
                  </p>
                ) : (
                  <>
                    <h2 className="mt-1 text-xl font-bold text-slate-900">
                      See what Signal Bridge can do for your organization.
                    </h2>
                    <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">
                      Events from many sources can start Flows that coordinate decision logic,
                      communications, and connected devices from one place.
                    </p>
                  </>
                )}
              </div>
              {nextModule ? (
                <button
                  type="button"
                  onClick={() => handleModuleSelect(nextModule.id)}
                  className="inline-flex shrink-0 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  Next: {nextModule.name} →
                </button>
              ) : (
                <a
                  href="/contact"
                  className="inline-flex shrink-0 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  Talk to our team
                </a>
              )}
            </section>
          )}

          <div role="status" className="sr-only">
            {statusText}
          </div>
        </div>
        </div>
        <footer className="flex shrink-0 items-center justify-center gap-3 border-t border-slate-200 bg-white px-4 py-2 text-center text-xs text-slate-500 sm:justify-between">
          <span>Demonstration only. No calls, messages, pages, or device commands leave this browser.</span>
          <a href="/contact" className="hidden shrink-0 font-semibold text-blue-600 hover:text-blue-700 sm:inline">
            Talk to our team →
          </a>
        </footer>
      </div>
    </div>
  );
}

export default Experience;
