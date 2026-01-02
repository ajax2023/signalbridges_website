function Reliability() {
  return (
    <section className="space-y-10">
      <div className="max-w-3xl space-y-4">
        <p className="text-[0.65rem] font-semibold tracking-[0.25em] text-sky-400/80 uppercase">
          Reliability & offline
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Designed to function when infrastructure is under stress.
        </h1>
        <p className="text-sm text-slate-300">
          Signal Bridge™ emphasizes predictable behavior during degraded network
          conditions. The goal is to keep operators informed about what the
          system is doing and how far each alert has progressed.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-5">
          <h2 className="text-sm font-semibold text-slate-100">Offline-aware endpoints</h2>
          <p className="mt-2 text-sm text-slate-400">
            Desktop and on-premise components can be designed to continue
            operating with local queues and policy when upstream connectivity is
            intermittent.
          </p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-5">
          <h2 className="text-sm font-semibold text-slate-100">Store-and-forward delivery</h2>
          <p className="mt-2 text-sm text-slate-400">
            Alerts can be held in durable queues and forwarded when paths become
            available, reducing the risk of silent drops during outages.
          </p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-5">
          <h2 className="text-sm font-semibold text-slate-100">Visibility for operators</h2>
          <p className="mt-2 text-sm text-slate-400">
            Operators can see whether alerts are queued, partially delivered, or
            fully acknowledged, so they can decide when to escalate.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-100">Resilience patterns</h2>
          <ul className="space-y-2 text-sm text-slate-400 list-disc list-inside">
            <li>Multi-path delivery where channels can be combined.</li>
            <li>Endpoint agents that can be configured close to facilities.</li>
            <li>Clear states for queued, in-progress, and failed deliveries.</li>
          </ul>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-100">Disaster recovery posture</h2>
          <p className="text-sm text-slate-400">
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
