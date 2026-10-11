import brandLogo from '../assets/signal-bridge-console.png';
import { bridgeView } from './learning/bridgeView';

function FlowPanel({ event, timeline }) {
  const steps = bridgeView(event, timeline);
  const live = timeline.status === 'running' || timeline.status === 'complete';

  return (
    <section
      className="relative flex h-full flex-col rounded-3xl border border-slate-200/80 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] sm:p-5"
      aria-label="Signal Bridge"
    >
      <div className="mb-2">
        <h2 className="text-base font-semibold text-slate-900">Signal Bridge</h2>
        <p className="text-sm text-slate-500">Processes the event.</p>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center py-4">
        <div className="sb-learn__logo-glow flex h-36 w-36 items-center justify-center rounded-[2rem]">
          <img
            src={brandLogo}
            alt="Signal Bridge logo"
            className={['h-24 w-24 object-contain', live ? 'sb-experience__pulse' : ''].join(' ')}
          />
        </div>
      </div>

      <ol className="rounded-2xl bg-[#10243d] p-4 text-white" aria-live="polite">
        {steps.map((step) => (
          <li key={step.id} data-step={step.id} data-state={step.state} className="flex gap-3 py-1.5">
            <span
              className={[
                'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[0.7rem] font-bold',
                step.state === 'idle'
                  ? 'bg-white/10 text-slate-500'
                  : 'bg-emerald-400 text-[#10243d]',
                step.state === 'active' ? 'sb-experience__step-active' : '',
              ].join(' ')}
              aria-hidden="true"
            >
              {step.state === 'idle' ? '' : '✓'}
            </span>
            <span className="min-w-0">
              <span className={['block text-sm font-semibold', step.state === 'idle' ? 'text-slate-400' : 'text-white'].join(' ')}>
                {step.label}
              </span>
              <span className={['block text-xs', step.state === 'idle' ? 'text-slate-500' : 'text-slate-300'].join(' ')}>
                {step.detail}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default FlowPanel;
