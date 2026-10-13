const reliabilityFeatures = [
  {
    number: '01',
    title: 'Offline-aware endpoints',
    description:
      'Desktop and on-premise components can continue operating with local queues and policy when upstream connectivity is intermittent.',
  },
  {
    number: '02',
    title: 'Store-and-forward delivery',
    description:
      'Alerts can be held in durable queues and forwarded when paths become available, reducing the risk of silent drops during outages.',
  },
  {
    number: '03',
    title: 'Visibility for operators',
    description:
      'Operators can see whether alerts are queued, partially delivered, or fully acknowledged, so they can decide when to escalate.',
  },
];

function Reliability() {
  return (
    <section className="space-y-8">
      <div className="space-y-4">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-600">
          Reliability & offline
        </p>
        <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">
          Designed to function when infrastructure is under stress.
        </h1>
        <div className="w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 shadow-sm">
          <p className="text-base leading-relaxed text-slate-700">
            Signal Bridge™ emphasizes predictable behavior during degraded network
            conditions. The goal is to keep operators informed about what the
            system is doing and how far each alert has progressed.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {reliabilityFeatures.map((feature) => (
          <article
            key={feature.number}
            className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
              {feature.number}
            </span>
            <h2 className="mt-5 text-xl font-bold text-slate-900">{feature.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.description}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <h2 className="text-xl font-bold text-slate-900">Resilience patterns</h2>
          <p className="mt-1 text-sm text-slate-500">Delivery options that help operations continue.</p>
          <ul className="mt-5 space-y-3 text-sm leading-relaxed text-slate-600">
            {[
              'Multi-path delivery where channels can be combined.',
              'Endpoint agents that can be configured close to facilities.',
              'Clear states for queued, in-progress, and failed deliveries.',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <h2 className="text-xl font-bold text-slate-900">Disaster recovery posture</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Deployment topologies can be designed to support regional isolation,
            backup, and restore processes appropriate for your environment. Your
            team retains control over RPO/RTO objectives and verification.
          </p>
        </article>
      </div>
    </section>
  );
}

export default Reliability;
