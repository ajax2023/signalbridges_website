import signalBridgeDiagram from '../assets/Signal Bridge Simple Drawing.png';

const features = [
  {
    number: '01',
    title: 'Two paging paths',
    subtitle: 'LAN + cloud',
    description:
      'RTP paging is emitted by the on-prem agent on your LAN and can run offline after initial setup. SIP paging uses Twilio and requires cloud connectivity. Routing is explicit and deterministic with tenant isolation and targeted agent selection.',
  },
  {
    number: '02',
    title: 'Agent as execution boundary',
    subtitle: 'Local continuity',
    description:
      'The agent executes media and device actions on the LAN and provides a local UI for offline paging. Media-plane continuity is preserved even if backend or MQTT services are temporarily unavailable once sessions are established.',
  },
  {
    number: '03',
    title: 'Auditable by design',
    subtitle: 'Clear history',
    description:
      'SIP paging has full lifecycle audit logs per tenant. Online actions are recorded with user, tenant, and timestamps. Offline paging events are logged locally on the agent for after-action review.',
  },
];

function Home() {
  return (
    <section className="space-y-8">
      <div className="space-y-4">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-600">
          Defense-first alert delivery
        </p>
        <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">
          Reliable alerts when your community cannot afford delays.
        </h1>
        <div className="w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 shadow-sm">
          <p className="text-base leading-relaxed text-slate-700">
            Signal Bridge™ delivers paging over two paths: LAN-based RTP via the on-prem
            agent that continues operating offline once configured, and SIP via Twilio
            for cloud-dependent scenarios. The agent executes media and device actions on
            the LAN, enabling deterministic, auditable delivery even during backend or
            MQTT outages.
          </p>
        </div>
        <div className="flex flex-col gap-3 pt-1 sm:flex-row">
          <a
            href="/contact"
            className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:w-auto"
          >
            Talk to our team
          </a>
          <a
            href="/product"
            className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:w-auto"
          >
            Explore the product
          </a>
        </div>
      </div>

      <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1 space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Architecture overview</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                Cloud authorization with local execution
              </h2>
            </div>
            <p className="text-base font-medium leading-relaxed text-slate-700">
              Cloud authorization with local execution and offline-capable RTP paging.
            </p>
            <p className="text-sm leading-relaxed text-slate-600">
              The Signal Bridge Control Plane handles identity &amp; access control, alert
              routing, policy enforcement, and notification channels. The on‑prem agent
              maintains LAN device connectivity and RTP paging execution, preserving
              operations during WAN or backend outages. Integration channels include
              webhooks, SMS, SIP, and email.
            </p>
          </div>
          <div className="flex min-w-0 flex-1 items-center justify-center rounded-2xl bg-[#f4f7fb] p-4 sm:p-6">
            <img
              src={signalBridgeDiagram}
              alt="Signal Bridge Control Plane Architecture"
              className="h-auto max-h-80 w-full object-contain"
            />
          </div>
        </div>
      </article>

      <div>
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Built for continuity</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Reliable delivery, clearly explained</h2>
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
