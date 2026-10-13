import { Link } from 'react-router-dom';

const exploreLinks = [
  { to: '/product', label: 'Product' },
  { to: '/experience', label: 'Experience' },
  { to: '/reliability', label: 'Reliability' },
  { to: '/security', label: 'Security' },
];

const connectLinks = [
  { to: '/contact', label: 'Contact' },
  { to: '/downloads', label: 'Downloads' },
];

const linkClass =
  'w-fit rounded-sm text-sm text-slate-600 transition-colors hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2';

function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6">
        <div className="grid gap-7 sm:grid-cols-3 sm:gap-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-900">Signal Bridge</p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-600">
              Connecting events, communications, and devices.
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-900">Explore</p>
            <nav className="mt-3 grid gap-2" aria-label="Footer explore">
              {exploreLinks.map((item) => (
                <Link key={item.to} to={item.to} className={linkClass}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-900">Connect</p>
            <nav className="mt-3 grid gap-2" aria-label="Footer connect">
              {connectLinks.map((item) => (
                <Link key={item.to} to={item.to} className={linkClass}>
                  {item.label}
                </Link>
              ))}
              <a href="mailto:admin@signalbridges.com" className={linkClass}>
                Email: admin@signalbridges.com
              </a>
            </nav>
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-2 border-t border-slate-200 pt-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>Copyright © 2026 Signal Bridge™</span>
          <span>Built for organizations that depend on reliable communications.</span>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
