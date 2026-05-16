function Product() {
  return (
    <section className="space-y-6">
      <div className="max-w-2xl space-y-2.5">
        <p className="text-[0.6rem] font-semibold tracking-[0.25em] text-sky-400/80 uppercase">
          Product
        </p>
        <h1 className="text-3xl font-semibold tracking-tight leading-snug sm:text-4xl">
          A focused path from incident to confirmed delivery.
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          Signal Bridge™ is built for teams that operate under pressure: K-12 and
          higher education, public safety agencies, hospitals, and defense
          organizations. The product keeps operators focused on the incident while
          the platform manages routing, delivery, and acknowledgement tracking.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 flex flex-col">
          <h2 className="text-xs font-semibold text-slate-100 uppercase tracking-wide">1. Ingest</h2>
          <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
            Operators or integrated systems create an alert with structured
            metadata, severity, and target audiences. The system standardizes
            input so downstream delivery is predictable.
          </p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 flex flex-col">
          <h2 className="text-xs font-semibold text-slate-100 uppercase tracking-wide">2. Route</h2>
          <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
            Policy-driven routing ensures the right people and roles see the alert
            through channels that make sense for their environment.
          </p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 flex flex-col">
          <h2 className="text-xs font-semibold text-slate-100 uppercase tracking-wide">3. Confirm</h2>
          <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
            Delivery and acknowledgement signals are surfaced so command staff and
            leadership can understand reach, gaps, and follow-up actions.
          </p>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 space-y-2">
          <h2 className="text-xs font-semibold text-slate-100 uppercase tracking-wide">Built for complex environments</h2>
          <ul className="space-y-1.5 text-xs text-slate-400 list-disc list-inside leading-relaxed">
            <li>Multiple campuses, facilities, or jurisdictions.</li>
            <li>Mixed device fleets and connectivity conditions.</li>
            <li>Operators with varying technical backgrounds.</li>
          </ul>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 space-y-2">
          <h2 className="text-xs font-semibold text-slate-100 uppercase tracking-wide">Key capabilities</h2>
          <ul className="space-y-1.5 text-xs text-slate-400 list-disc list-inside leading-relaxed">
            <li>Structured alert composition with templates.</li>
            <li>Role-aware targeting for staff and partner agencies.</li>
            <li>Delivery status and acknowledgement visibility.</li>
            <li>Operator activity history for after-action review.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default Product;
