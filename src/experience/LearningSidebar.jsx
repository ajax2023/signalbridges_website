import { LEARNING_MODULES } from './learning/modules';
import { isModuleComplete } from './learning/progress';

function LearningSidebar({ activeId, progress, open, onSelect, onClose }) {
  return (
    <>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-slate-900/50 xl:hidden"
          aria-label="Close learning modules"
          onClick={onClose}
        />
      )}
      <nav
        aria-label="Learning modules"
        className={[
          'z-40 w-[17.75rem] shrink-0 bg-[#0b2340] text-white',
          open
            ? 'fixed inset-y-0 left-0 flex flex-col'
            : 'hidden h-full min-h-0 flex-col xl:flex',
        ].join(' ')}
      >
        <div className="flex items-center justify-between px-4 py-3 xl:hidden">
          <p className="text-sm font-semibold">Learning modules</p>
          <button
            type="button"
            className="rounded-md px-2 py-1 text-sm text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="border-b border-white/10 px-4 py-3">
          <p className="text-sm font-semibold text-white">Interactive Experience</p>
          <p className="mt-1 text-xs leading-snug text-slate-300">
            Discover how Signal Bridge connects events, Flows, and actions through ten interactive demonstrations.
          </p>
        </div>
        <div className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
          {LEARNING_MODULES.map((module) => {
            const active = module.id === activeId;
            const complete = isModuleComplete(progress, module.id);
            return (
              <button
                key={module.id}
                type="button"
                onClick={() => onSelect(module.id)}
                aria-current={active ? 'page' : undefined}
                className={[
                  'flex w-full items-start gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300',
                  active ? 'bg-[#16375f] ring-1 ring-inset ring-sky-400/40' : 'hover:bg-white/5',
                ].join(' ')}
              >
                <span
                  className={[
                    'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                    active
                      ? 'bg-blue-500 text-white'
                      : complete
                        ? 'bg-emerald-500/20 text-emerald-200'
                        : 'bg-white/10 text-slate-300',
                  ].join(' ')}
                  aria-hidden="true"
                >
                  {module.id}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold leading-tight text-white">{module.name}</span>
                  <span className="mt-0.5 block text-xs leading-snug text-slate-400">{module.description}</span>
                </span>
                <span
                  className={[
                    'mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
                    complete
                      ? 'border-emerald-400 bg-emerald-500 text-[0.6rem] text-white'
                      : active
                        ? 'border-blue-300 bg-blue-400'
                        : 'border-slate-500 bg-transparent',
                  ].join(' ')}
                  aria-hidden="true"
                >
                  {complete ? '✓' : ''}
                </span>
                <span className="sr-only">
                  {complete ? 'Completed' : 'Not completed'}
                  {active ? ', current module' : ''}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}

export default LearningSidebar;
