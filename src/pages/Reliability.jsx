function Reliability() {
  return (
    <section className="space-y-6">
      <div className="max-w-2xl space-y-2.5">
        <p className="text-[0.6rem] font-semibold tracking-[0.25em] text-sky-400/80 uppercase">
          Reliability & offline
        </p>
        <h1 className="text-3xl font-semibold tracking-tight leading-snug sm:text-4xl">
          Designed to function when infrastructure is under stress.
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          Signal Bridge™ emphasizes predictable behavior during degraded network
          conditions. The goal is to keep operators informed about what the
          system is doing and how far each alert has progressed.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 flex flex-col">
          <h2 className="text-xs font-semibold text-slate-100 uppercase tracking-wide">Offline-aware endpoints</h2>
          <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
            Desktop and on-premise components can be designed to continue
            operating with local queues and policy when upstream connectivity is
            intermittent.
          </p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 flex flex-col">
          <h2 className="text-xs font-semibold text-slate-100 uppercase tracking-wide">Store-and-forward delivery</h2>
          <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
            Alerts can be held in durable queues and forwarded when paths become
            available, reducing the risk of silent drops during outages.
          </p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 flex flex-col">
          <h2 className="text-xs font-semibold text-slate-100 uppercase tracking-wide">Visibility for operators</h2>
          <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
            Operators can see whether alerts are queued, partially delivered, or
            fully acknowledged, so they can decide when to escalate.
          </p>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 space-y-2">
          <h2 className="text-xs font-semibold text-slate-100 uppercase tracking-wide">Resilience patterns</h2>
          <ul className="space-y-1.5 text-xs text-slate-400 list-disc list-inside leading-relaxed">
            <li>Multi-path delivery where channels can be combined.</li>
            <li>Endpoint agents that can be configured close to facilities.</li>
            <li>Clear states for queued, in-progress, and failed deliveries.</li>
          </ul>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 space-y-2">
          <h2 className="text-xs font-semibold text-slate-100 uppercase tracking-wide">Disaster recovery posture</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Deployment topologies can be designed to support regional isolation,
            backup, and restore processes appropriate for your environment. Your
            team retains control over RPO/RTO objectives and verification.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Reliability;
