import { useMemo } from 'react';
import EventsPanel from '../experience/EventsPanel';
import FlowPanel from '../experience/FlowPanel';
import ActionsPanel from '../experience/ActionsPanel';
import { useExperienceTimeline } from '../experience/engine/useExperienceTimeline';
import { GENERAL_SCENARIO } from '../experience/scenarios/general';
import '../experience/experience.css';

function Experience() {
  const scenario = GENERAL_SCENARIO;
  const { state, play, replay, reset } = useExperienceTimeline();

  const selectedEvent = useMemo(
    () => scenario.events.find((e) => e.id === state.eventId) || null,
    [scenario.events, state.eventId],
  );

  const running = state.status === 'running';
  const complete = state.status === 'complete';

  function handleSelect(eventId) {
    if (running) return;
    const event = scenario.events.find((e) => e.id === eventId);
    if (!event) return;
    play(event);
  }

  function handleReplay() {
    if (!selectedEvent || running) return;
    replay(selectedEvent);
  }

  return (
    <div className="sb-experience min-h-[calc(100vh-8.5rem)] px-4 py-8 sm:px-6 lg:min-h-[calc(100vh-9rem)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-400">
                Interactive experience
              </p>
              <span className="rounded-md border border-amber-400/35 bg-amber-400/10 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-amber-200">
                All actions simulated
              </span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {scenario.title}
            </h1>
            <p className="text-sm text-slate-300">
              {scenario.subtitle}. {scenario.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleReplay}
              disabled={!selectedEvent || running}
              className="inline-flex items-center justify-center rounded-md bg-sky-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Replay
            </button>
            <button
              type="button"
              onClick={reset}
              disabled={state.status === 'idle'}
              className="inline-flex items-center justify-center rounded-md border border-slate-600 bg-slate-900/60 px-4 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-slate-400 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Reset
            </button>
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-12 lg:gap-5 lg:items-stretch">
          <div className="lg:col-span-3 min-h-[22rem]">
            <EventsPanel
              events={scenario.events}
              selectedEventId={state.eventId}
              running={running}
              onSelect={handleSelect}
            />
          </div>
          <div className="lg:col-span-5 min-h-[22rem]">
            <FlowPanel event={selectedEvent} timeline={state} />
          </div>
          <div className="lg:col-span-4 min-h-[22rem]">
            <ActionsPanel event={selectedEvent} timeline={state} />
          </div>
        </div>

        <p className="text-center text-[0.7rem] text-slate-500">
          Demonstration only — no emails, calls, paging, or device commands are sent.
          {complete ? ' Run complete. Replay or choose another event.' : ''}
        </p>
      </div>
    </div>
  );
}

export default Experience;
