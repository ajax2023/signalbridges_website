function Security() {
  return (
    <section className="space-y-6">
      <div className="max-w-2xl space-y-2.5">
        <p className="text-[0.6rem] font-semibold tracking-[0.25em] text-sky-400/80 uppercase">
          Security posture
        </p>
        <h1 className="text-3xl font-semibold tracking-tight leading-snug sm:text-4xl">
          A conservative, layered approach to protecting alerts and data.
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          This page outlines design intentions and guardrails at a high level.
          It is not a certification statement. Detailed documentation and
          security reviews should be completed directly with your security team.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
          <h2 className="text-xs font-semibold text-slate-100 uppercase tracking-wide">Data handling</h2>
          <ul className="mt-2 space-y-1.5 text-xs text-slate-400 list-disc list-inside leading-relaxed">
            <li>Scoped data collection focused on operational alert content.</li>
            <li>Separation of operator identities from alert payloads where practical.</li>
            <li>Retention policies that can be aligned with your requirements.</li>
          </ul>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
          <h2 className="text-xs font-semibold text-slate-100 uppercase tracking-wide">Access control</h2>
          <ul className="mt-2 space-y-1.5 text-xs text-slate-400 list-disc list-inside leading-relaxed">
            <li>Role- and responsibility-based access to operator functions.</li>
            <li>Administrative boundaries for campuses, facilities, or regions.</li>
            <li>Support for change management and auditability of key actions.</li>
          </ul>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
          <h2 className="text-xs font-semibold text-slate-100 uppercase tracking-wide">Platform hygiene</h2>
          <ul className="mt-2 space-y-1.5 text-xs text-slate-400 list-disc list-inside leading-relaxed">
            <li>Use of maintained dependencies and regular update windows.</li>
            <li>Environment separation for development, testing, and production.</li>
            <li>Monitoring for anomalous platform behavior where deployed.</li>
          </ul>
        </div>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 space-y-2.5 max-w-2xl">
        <h2 className="text-xs font-semibold text-slate-100 uppercase tracking-wide">Working with your security team</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Signal Bridge™ is intended to fit within existing security architectures
          rather than replace them. Network topology, identity systems, device
          management, and incident response remain under your control. Product
          documentation and security review materials can be shared directly
          under appropriate agreements.
        </p>
        <p className="text-xs text-slate-500 leading-relaxed border-t border-slate-800/70 pt-2.5">
          Detailed deployment and architecture documentation is provided during
          technical evaluation and deployment planning.
        </p>
      </div>
    </section>
  );
}

export default Security;
