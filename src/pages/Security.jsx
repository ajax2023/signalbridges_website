const securityLayers = [
  {
    number: '01',
    title: 'Controlled access',
    items: [
      'Firebase authentication protects online operator and administrative access.',
      'Backend role checks and action-specific permissions are applied to implemented APIs.',
      'Agent provisioning binds an Agent identity to its assigned tenant.',
    ],
  },
  {
    number: '02',
    title: 'Tenant boundaries',
    items: [
      'Tenant-scoped records and authorization checks separate covered operations.',
      'Cross-tenant access is blocked by implemented backend checks, not by hidden UI controls.',
      'Control coverage is reviewed by API and action during technical evaluation.',
    ],
  },
  {
    number: '03',
    title: 'Accountable operations',
    items: [
      'SIP paging records tenant-scoped call lifecycle and outcome information.',
      'Configured offline RTP paging writes local Agent audit events.',
      'Logging and audit depth vary by action and deployment configuration.',
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
          Security built around controlled access, tenant isolation, and accountable operations.
        </h1>
        <p className="max-w-4xl text-base leading-relaxed text-slate-600">
          Signal Bridge uses authenticated cloud access, backend authorization,
          tenant-scoped data, and provisioned Agent identities to establish clear
          operating boundaries. Controls are evaluated against the specific actions
          and deployment topology in use.
        </p>
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
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Technical qualification</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">Implemented controls, design goals, and certifications</h2>
        </div>
        <p className="mt-4 max-w-4xl text-sm leading-relaxed text-slate-600">
          The controls described above reflect implemented foundations, with
          action-specific scope and configuration requirements. Broader hardening
          objectives are treated as design goals until verified for the proposed
          deployment. Signal Bridge does not claim ISO 27001, SOC 2, or another
          independent certification on this page.
        </p>
        <p className="mt-5 border-t border-slate-200 pt-4 text-sm leading-relaxed text-slate-500">
          Your network topology, identity integration, device management, retention,
          and incident-response requirements should be confirmed during technical
          evaluation and deployment planning.
        </p>
      </article>
    </section>
  );
}

export default Security;
