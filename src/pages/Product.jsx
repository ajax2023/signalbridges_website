function Product() {
  return (
    <section className="space-y-10">
      <div className="max-w-3xl space-y-4">
        <p className="text-[0.65rem] font-semibold tracking-[0.25em] text-sky-400/80 uppercase">
          Product
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          A focused path from incident to confirmed delivery.
        </h1>
        <p className="text-sm text-slate-300">
          Signal Bridge™ is built for teams that operate under pressure: K-12 and
          higher education, public safety agencies, hospitals, and defense
          organizations. The product keeps operators focused on the incident while
          the platform manages routing, delivery, and acknowledgement tracking.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-5">
          <h2 className="text-sm font-semibold text-slate-100">1. Ingest</h2>
          <p className="mt-2 text-sm text-slate-400">
            Operators or integrated systems create an alert with structured
            metadata, severity, and target audiences. The system standardizes
            input so downstream delivery is predictable.
          </p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-5">
          <h2 className="text-sm font-semibold text-slate-100">2. Route</h2>
          <p className="mt-2 text-sm text-slate-400">
            Policy-driven routing ensures the right people and roles see the alert
            through channels that make sense for their environment.
          </p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-5">
          <h2 className="text-sm font-semibold text-slate-100">3. Confirm</h2>
          <p className="mt-2 text-sm text-slate-400">
            Delivery and acknowledgement signals are surfaced so command staff and
            leadership can understand reach, gaps, and follow-up actions.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-100">Built for complex environments</h2>
          <ul className="space-y-2 text-sm text-slate-400 list-disc list-inside">
            <li>Multiple campuses, facilities, or jurisdictions.</li>
            <li>Mixed device fleets and connectivity conditions.</li>
            <li>Operators with varying technical backgrounds.</li>
          </ul>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-100">Key capabilities</h2>
          <ul className="space-y-2 text-sm text-slate-400 list-disc list-inside">
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
