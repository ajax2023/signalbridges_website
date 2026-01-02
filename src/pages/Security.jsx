function Security() {
  return (
    <section className="space-y-10">
      <div className="max-w-3xl space-y-4">
        <p className="text-[0.65rem] font-semibold tracking-[0.25em] text-sky-400/80 uppercase">
          Security posture
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          A conservative, layered approach to protecting alerts and data.
        </h1>
        <p className="text-sm text-slate-300">
          This page outlines design intentions and guardrails at a high level.
          It is not a certification statement. Detailed documentation and
          security reviews should be completed directly with your security team.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-5">
          <h2 className="text-sm font-semibold text-slate-100">Data handling</h2>
          <ul className="mt-2 space-y-2 text-sm text-slate-400 list-disc list-inside">
            <li>Scoped data collection focused on operational alert content.</li>
            <li>Separation of operator identities from alert payloads where practical.</li>
            <li>Retention policies that can be aligned with your requirements.</li>
          </ul>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-5">
          <h2 className="text-sm font-semibold text-slate-100">Access control</h2>
          <ul className="mt-2 space-y-2 text-sm text-slate-400 list-disc list-inside">
            <li>Role- and responsibility-based access to operator functions.</li>
            <li>Administrative boundaries for campuses, facilities, or regions.</li>
            <li>Support for change management and auditability of key actions.</li>
          </ul>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-5">
          <h2 className="text-sm font-semibold text-slate-100">Platform hygiene</h2>
          <ul className="mt-2 space-y-2 text-sm text-slate-400 list-disc list-inside">
            <li>Use of maintained dependencies and regular update windows.</li>
            <li>Environment separation for development, testing, and production.</li>
            <li>Monitoring for anomalous platform behavior where deployed.</li>
          </ul>
        </div>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-5 space-y-3 max-w-3xl">
        <h2 className="text-sm font-semibold text-slate-100">Working with your security team</h2>
        <p className="text-sm text-slate-400">
          Signal Bridge™ is intended to fit within existing security architectures
          rather than replace them. Network topology, identity systems, device
          management, and incident response remain under your control. Product
          documentation and security review materials can be shared directly
          under appropriate agreements.
        </p>
      </div>
    </section>
  );
}

export default Security;
