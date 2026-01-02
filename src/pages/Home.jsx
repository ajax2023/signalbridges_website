function Home() {
  return (
    <section className="space-y-10">
      <div className="max-w-3xl space-y-4">
        <p className="text-[0.65rem] font-semibold tracking-[0.25em] text-sky-400/80 uppercase">
          Defense-first alert delivery
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Reliable alerts when your community cannot afford delays.
        </h1>
        <p className="text-base text-slate-300">
          Signal Bridge™ is designed first for military operations and defense teams,
          with applicability to schools and critical infrastructure that need a
          predictable path from incident to notification, even when networks are
          degraded or offline.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <a
            href="/contact"
            className="inline-flex items-center justify-center rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-sky-400 w-full sm:w-auto"
          >
            Talk to our team
          </a>
          <a
            href="/product"
            className="inline-flex items-center justify-center rounded-md border border-slate-700 px-4 py-2 text-sm font-medium text-slate-100 hover:border-slate-500 w-full sm:w-auto"
          >
            Explore the product
          </a>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-5">
          <h2 className="text-sm font-semibold text-slate-100">Multi-channel delivery</h2>
          <p className="mt-2 text-sm text-slate-400">
            Reserve this space to describe how alerts flow from Signal Bridge™ into the
            channels your teams rely on.
          </p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-5">
          <h2 className="text-sm font-semibold text-slate-100">Offline-aware design</h2>
          <p className="mt-2 text-sm text-slate-400">
            Use this panel to explain how the system behaves when connectivity is
            intermittent or unavailable.
          </p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-5">
          <h2 className="text-sm font-semibold text-slate-100">Operational traceability</h2>
          <p className="mt-2 text-sm text-slate-400">
            Highlight how operators and leadership can see status, ownership, and
            acknowledgements for each alert.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Home;
