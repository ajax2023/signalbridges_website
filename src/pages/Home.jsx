import signalBridgeDiagram from '../assets/Signal Bridge Simple Drawing.png';

function Home() {
  return (
    <section className="space-y-6">

      {/* Hero */}
      <div className="max-w-2xl space-y-2.5">
        <p className="text-[0.6rem] font-semibold tracking-[0.25em] text-sky-400/80 uppercase">
          Defense-first alert delivery
        </p>
        <h1 className="text-3xl font-semibold tracking-tight leading-snug sm:text-4xl">
          Reliable alerts when your community cannot afford delays.
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
          Signal Bridge™ delivers paging over two paths: LAN-based RTP via the on‑prem
          agent that continues operating offline once configured, and SIP via Twilio
          for cloud-dependent scenarios. The agent executes media and device actions on
          the LAN, enabling deterministic, auditable delivery even during backend or
          MQTT outages.
        </p>
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <a
            href="/contact"
            className="inline-flex items-center justify-center rounded-md bg-sky-500 px-4 py-1.5 text-sm font-medium text-slate-950 hover:bg-sky-400 w-full sm:w-auto"
          >
            Talk to our team
          </a>
          <a
            href="/product"
            className="inline-flex items-center justify-center rounded-md border border-slate-700 px-4 py-1.5 text-sm font-medium text-slate-100 hover:border-slate-500 w-full sm:w-auto"
          >
            Explore the product
          </a>
        </div>
      </div>

      {/* Architecture Overview */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/50 shadow-lg shadow-black/30 p-5">
        <p className="text-[0.6rem] font-semibold tracking-[0.2em] text-sky-400/70 uppercase mb-3">
          Architecture Overview
        </p>
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          <div className="lg:w-2/5 space-y-2.5 flex-shrink-0">
            <p className="text-sm text-slate-300 leading-snug font-medium">
              Cloud authorization with local execution and offline-capable RTP paging.
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              The Signal Bridge Control Plane handles identity &amp; access control, alert
              routing, policy enforcement, and notification channels. The on‑prem agent
              maintains LAN device connectivity and RTP paging execution, preserving
              operations during WAN or backend outages. Integration channels include
              webhooks, SMS, SIP, and email.
            </p>
          </div>
          <div className="lg:w-3/5 flex-shrink min-w-0">
            <img
              src={signalBridgeDiagram}
              alt="Signal Bridge Control Plane Architecture"
              className="w-full h-auto max-h-64 object-contain rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 flex flex-col">
          <h2 className="text-xs font-semibold text-slate-100 uppercase tracking-wide">Two paging paths</h2>
          <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
            RTP paging is emitted by the on‑prem agent on your LAN and can run offline
            after initial setup. SIP paging uses Twilio and requires cloud
            connectivity. Routing is explicit and deterministic with tenant isolation
            and targeted agent selection.
          </p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 flex flex-col">
          <h2 className="text-xs font-semibold text-slate-100 uppercase tracking-wide">Agent as execution boundary</h2>
          <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
            The agent executes media (RTP multicast) and device actions on the LAN and
            provides a local UI for offline paging. Media‑plane continuity is preserved
            even if control‑plane services (backend or MQTT) are temporarily
            unavailable once sessions are established.
          </p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 flex flex-col">
          <h2 className="text-xs font-semibold text-slate-100 uppercase tracking-wide">Auditable by design</h2>
          <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
            SIP paging has full lifecycle audit logs per tenant. Online actions are
            recorded with user, tenant, and timestamps. Offline paging events are
            logged locally on the agent for after‑action review.
          </p>
        </div>
      </div>

    </section>
  );
}

export default Home;
