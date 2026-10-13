import signalBridgeDiagram from '../assets/experience-icons/Signal Bridge event-driven action architecture.png';

const features = [
  {
    number: '01',
    title: 'Connect the event',
    subtitle: 'Many sources',
    description:
      'Bring buttons, sensors, schedules, webhooks, SIP events, and connected systems into one operating model.',
  },
  {
    number: '02',
    title: 'Coordinate the response',
    subtitle: 'Flexible Flows',
    description:
      'Use conditions, waits, decisions, acknowledgments, and escalation steps to move each event toward the right outcome.',
  },
  {
    number: '03',
    title: 'Act with visibility',
    subtitle: 'Track execution',
    description:
      'Coordinate communications and devices while surfacing delivery, failure, acknowledgment, and activity data where each channel supports it.',
  },
];

function Home() {
  return (
    <section className="space-y-8">
      <div className="space-y-4">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-600">
          Events → Flows → Actions
        </p>
        <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">
          From event to action. All connected.
        </h1>
        <p className="max-w-4xl text-base leading-relaxed text-slate-600">
          Signal Bridge connects buttons, sensors, schedules, and external systems
          to automated Flows that coordinate notifications, voice communications,
          paging, and connected devices.
        </p>
        <div className="flex flex-col gap-3 pt-1 sm:flex-row">
          <a
            href="/experience"
            className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:w-auto"
          >
            Explore the Experience
          </a>
          <a
            href="/contact"
            className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:w-auto"
          >
            Talk to our team
          </a>
        </div>
      </div>

      <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1 space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Architecture overview</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                How Signal Bridge connects everything
              </h2>
            </div>
            <p className="text-base font-medium leading-relaxed text-slate-700">
              Cloud orchestration coordinates events and actions; the on-premises Agent
              reaches devices and paging endpoints on the local network.
            </p>
            <p className="text-sm leading-relaxed text-slate-600">
              During normal operation, cloud services support authorization and
              orchestration. The on-premises Agent executes supported local device actions
              and RTP paging. When configured in advance, local RTP paging can operate
              without Internet connectivity under supported LAN conditions; cloud
              notifications, SIP calling, and other cloud-coordinated actions still
              require their online services.
            </p>
          </div>
          <div className="flex min-w-0 flex-1 items-center justify-center rounded-2xl bg-[#f4f7fb] p-4 sm:p-6">
            <img
              src={signalBridgeDiagram}
              alt="Signal Bridge event-driven action architecture"
              className="h-auto max-h-80 w-full object-contain"
            />
          </div>
        </div>
      </article>

      <div>
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">One connected model</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Events become coordinated action</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.number}
              className="flex h-full flex-col rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {feature.number}
                </span>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  {feature.subtitle}
                </span>
              </div>
              <h3 className="mt-5 text-xl font-bold text-slate-900">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Home;
