const securityLayers = [
  {
    number: '01',
    title: 'Data handling',
    items: [
      'Scoped data collection focused on operational alert content.',
      'Separation of operator identities from alert payloads where practical.',
      'Retention policies that can be aligned with your requirements.',
    ],
  },
  {
    number: '02',
    title: 'Access control',
    items: [
      'Role- and responsibility-based access to operator functions.',
      'Administrative boundaries for campuses, facilities, or regions.',
      'Support for change management and auditability of key actions.',
    ],
  },
  {
    number: '03',
    title: 'Platform hygiene',
    items: [
      'Use of maintained dependencies and regular update windows.',
      'Environment separation for development, testing, and production.',
      'Monitoring for anomalous platform behavior where deployed.',
    ],
  },
];

function Security() {
  return (
    <section className="space-y-8">
      <div className="space-y-4">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-600">
          Security posture
        </p>
        <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">
          A conservative, layered approach to protecting alerts and data.
        </h1>
        <div className="w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 shadow-sm">
          <p className="text-base leading-relaxed text-slate-700">
            This page outlines design intentions and guardrails at a high level.
            It is not a certification statement. Detailed documentation and
            security reviews should be completed directly with your security team.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {securityLayers.map((layer) => (
          <article
            key={layer.number}
            className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
              {layer.number}
            </span>
            <h2 className="mt-5 text-xl font-bold text-slate-900">{layer.title}</h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
              {layer.items.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:p-8">
        <div className="max-w-4xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Technical evaluation</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">Working with your security team</h2>
        </div>
        <p className="mt-4 max-w-4xl text-sm leading-relaxed text-slate-600">
          Signal Bridge™ is intended to fit within existing security architectures
          rather than replace them. Network topology, identity systems, device
          management, and incident response remain under your control. Product
          documentation and security review materials can be shared directly
          under appropriate agreements.
        </p>
        <p className="mt-5 border-t border-slate-200 pt-4 text-sm leading-relaxed text-slate-500">
          Detailed deployment and architecture documentation is provided during
          technical evaluation and deployment planning.
        </p>
      </article>
    </section>
  );
}

export default Security;
