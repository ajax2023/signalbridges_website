function Downloads() {
  return (
    <section className="space-y-10">
      <div className="max-w-3xl space-y-4">
        <p className="text-[0.65rem] font-semibold tracking-[0.25em] text-sky-400/80 uppercase">
          Downloads
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Operator console and on-premise agent.
        </h1>
        <p className="text-sm text-slate-300">
          This page will host verified downloads for the Signal Bridge™ operator
          console and on-premise agent. Links below are placeholders until your
          distribution pipeline is defined.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-100">Desktop operator console</h2>
          <p className="text-sm text-slate-400">
            Electron-based desktop application for dispatchers, security teams,
            and operations centers.
          </p>
          <div className="flex flex-wrap gap-3 pt-1 text-xs">
            <button
              type="button"
              className="rounded-md border border-slate-700 bg-slate-900/40 px-3 py-1.5 text-slate-200"
            >
              Windows x64  placeholder
            </button>
            <button
              type="button"
              className="rounded-md border border-slate-700 bg-slate-900/40 px-3 py-1.5 text-slate-200"
            >
              macOS (Intel/Apple)  placeholder
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-100">Signal Bridge™ agent</h2>
          <p className="text-sm text-slate-400">
            Lightweight service intended to run close to your infrastructure for
            connectivity, routing, or integration tasks.
          </p>
          <div className="flex flex-wrap gap-3 pt-1 text-xs">
            <button
              type="button"
              className="rounded-md border border-slate-700 bg-slate-900/40 px-3 py-1.5 text-slate-200"
            >
              Windows Server  placeholder
            </button>
            <button
              type="button"
              className="rounded-md border border-slate-700 bg-slate-900/40 px-3 py-1.5 text-slate-200"
            >
              Linux (x86_64)  placeholder
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Downloads;
