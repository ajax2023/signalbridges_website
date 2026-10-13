const executionSteps = [
  {
    number: '01',
    title: 'Events',
    subtitle: 'Start anywhere',
    description:
      'Start with a button, sensor, schedule, webhook, SIP event, or connected system.',
  },
  {
    number: '02',
    title: 'Flows',
    subtitle: 'Coordinate the logic',
    description:
      'Use conditions, waits, decisions, and escalation to coordinate the response.',
  },
  {
    number: '03',
    title: 'Actions',
    subtitle: 'Reach people and devices',
    description:
      'Send notifications, place calls, page speakers, update displays, or activate devices.',
  },
];

const environments = [
  'Routine operations, scheduled communications, and urgent response.',
  'Multiple campuses, facilities, sites, or jurisdictions.',
  'Mixed communications, device fleets, and connectivity conditions.',
];

const capabilities = [
  'Buttons, sensors, schedules, webhooks, SIP, and connected systems.',
  'Multi-step Flows with conditions, waits, decisions, and escalation.',
  'Notifications, calls, paging, displays, and device actions.',
  'Delivery, failure, acknowledgment, and activity visibility where supported.',
];

function CheckItem({ children }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700" aria-hidden="true">
        ✓
      </span>
      <span>{children}</span>
    </li>
  );
}

function Product() {
  return (
    <section className="space-y-8">
      <div className="space-y-4">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-600">
          Product
        </p>
        <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">
          Connect every event to a coordinated response.
        </h1>
        <p className="max-w-4xl text-base leading-relaxed text-slate-600">
          Signal Bridge brings routine operations and urgent response into the same
          model: events start Flows, Flows coordinate logic, and actions reach people,
          communications systems, and connected devices. Status, acknowledgments, and
          activity history provide visibility where the underlying action supports it.
        </p>
      </div>

      <div>
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">How it works</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Events → Flows → Actions</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {executionSteps.map((step) => (
            <article
              key={step.number}
              className="flex h-full flex-col rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {step.number}
                </span>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  {step.subtitle}
                </span>
              </div>
              <h3 className="mt-5 text-xl font-bold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.description}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600" aria-hidden="true">
            <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M5 27V13l7-4v18M12 27V6l8-3v24M20 27V11l7 3v13M3 27h26" />
              <path d="M8 17h1M8 21h1M15 9h2M15 14h2M15 19h2M23 17h1M23 21h1" />
            </svg>
          </span>
          <h2 className="mt-4 text-xl font-bold text-slate-900">Built for complex environments</h2>
          <p className="mt-1 text-sm text-slate-500">Useful for everyday coordination and time-sensitive response.</p>
          <ul className="mt-5 space-y-3 text-sm leading-relaxed text-slate-600">
            {environments.map((item) => <CheckItem key={item}>{item}</CheckItem>)}
          </ul>
        </article>

        <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600" aria-hidden="true">
            <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M7 16l6 6L25 9" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="16" cy="16" r="12" />
            </svg>
          </span>
          <h2 className="mt-4 text-xl font-bold text-slate-900">Key capabilities</h2>
          <p className="mt-1 text-sm text-slate-500">Connect event sources to coordinated communications and devices.</p>
          <ul className="mt-5 space-y-3 text-sm leading-relaxed text-slate-600">
            {capabilities.map((item) => <CheckItem key={item}>{item}</CheckItem>)}
          </ul>
        </article>
      </div>

      <div className="flex flex-col gap-5 rounded-3xl bg-[#0b2a4b] px-6 py-7 text-white shadow-[0_14px_35px_rgba(15,23,42,0.16)] sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <p className="text-sm font-semibold text-sky-300">See Signal Bridge in action</p>
          <h2 className="mt-1 text-2xl font-bold text-white">Explore events, flows, and coordinated actions.</h2>
        </div>
        <a
          href="/experience"
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b2a4b]"
        >
          See Signal Bridge in action
        </a>
      </div>
    </section>
  );
}

export default Product;
