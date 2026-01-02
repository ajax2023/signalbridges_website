import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Overview' },
  { to: '/product', label: 'Product' },
  { to: '/reliability', label: 'Reliability' },
  { to: '/security', label: 'Security' },
  { to: '/downloads', label: 'Downloads' },
  { to: '/contact', label: 'Contact' }
];

function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <header className="border-b border-slate-800">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-sky-500/80 flex items-center justify-center text-xs font-semibold tracking-tight text-slate-950">
              SB
            </div>
            <div>
              <div className="text-lg font-semibold tracking-tight">Signal Bridge™</div>
              <div className="hidden sm:block text-xs text-slate-400">
                Defense-first alert delivery for military, schools, and critical infrastructure
              </div>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    'px-2 py-1 rounded-md',
                    'hover:text-sky-300 hover:bg-slate-800/70',
                    isActive ? 'text-sky-300 bg-slate-800/80' : 'text-slate-300'
                  ].join(' ')
                }
                end={item.to === '/'}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <button
            type="button"
            className="md:hidden inline-flex items-center rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-100 hover:border-slate-500"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
          >
            Menu
          </button>
        </div>
      </header>
      {mobileOpen && (
        <nav id="mobile-nav" className="md:hidden border-b border-slate-800 bg-slate-900/60">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-2 grid gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    'block px-2 py-2 rounded-md text-sm',
                    'hover:text-sky-300 hover:bg-slate-800/70',
                    isActive ? 'text-sky-300 bg-slate-800/80' : 'text-slate-300'
                  ].join(' ')
                }
                end={item.to === '/'}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">{children}</div>
      </main>
      <footer className="border-t border-slate-800">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 text-xs text-slate-500 flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-4">
          <span>© {new Date().getFullYear()} Signal Bridge™.</span>
          <span>Built for schools, public safety, health, and defense teams.</span>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
