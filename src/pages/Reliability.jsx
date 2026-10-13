const reliabilityFeatures = [
  {
    number: '01',
    title: 'Cloud-connected execution',
    description:
      'During normal operation, cloud services authorize users, orchestrate actions, and connect cloud-dependent channels such as SIP and notifications.',
  },
  {
    number: '02',
    title: 'Local Agent execution',
    description:
      'The on-premises Agent reaches supported devices on the LAN and executes local device actions and RTP paging commands.',
  },
  {
    number: '03',
    title: 'Configured offline RTP paging',
    description:
      'After zones have been configured and cached, operators on the LAN can use the local Agent interface for RTP paging without cloud connectivity.',
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
          Know what keeps running—and what depends on the cloud.
        </h1>
        <div className="w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 shadow-sm">
          <p className="text-base leading-relaxed text-slate-700">
            Signal Bridge separates cloud orchestration from local execution so teams
            can plan for real dependencies. Offline capability is specific to configured
            local RTP paging; it does not mean every Flow, SIP call, notification, or
            device action operates without Internet connectivity.
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
          <h2 className="text-xl font-bold text-slate-900">Execution visibility</h2>
          <p className="mt-1 text-sm text-slate-500">Useful status without treating every channel as identical.</p>
          <ul className="mt-5 space-y-3 text-sm leading-relaxed text-slate-600">
            {[
              'Failures are surfaced when required cloud, Agent, or device dependencies are unavailable.',
              'SIP paging exposes call lifecycle and outcome information.',
              'Local offline RTP paging writes Agent-side audit events, with optional sync when configured.',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <h2 className="text-xl font-bold text-slate-900">Supported recovery mechanisms</h2>
          <p className="mt-1 text-sm text-slate-500">Recovery behavior follows the component that performs the work.</p>
          <ul className="mt-5 space-y-3 text-sm leading-relaxed text-slate-600">
            {[
              'Agent connectivity uses reconnection behavior after temporary service interruptions.',
              'Cached paging-zone configuration supports the local offline RTP path.',
              'Active direct RTP media sessions can continue after a cloud control-plane interruption once established.',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}

export default Reliability;
