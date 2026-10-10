import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import brandLogo from '../assets/signal-bridge-console.png';

const navItems = [
  { to: '/', label: 'Overview' },
  { to: '/product', label: 'Product' },
  { to: '/experience', label: 'Experience' },
  { to: '/reliability', label: 'Reliability' },
  { to: '/security', label: 'Security' },
  { to: '/downloads', label: 'Downloads' },
  { to: '/contact', label: 'Contact' },
];

function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const isExperience = pathname === '/experience';

  const shellClass = isExperience
    ? 'min-h-screen flex flex-col bg-slate-950 text-slate-100'
    : 'min-h-screen flex flex-col bg-white text-slate-900';

  const headerClass = isExperience
    ? 'border-b border-slate-800 bg-slate-950'
    : 'border-b border-slate-200 bg-white';

  const brandClass = isExperience
    ? 'text-lg font-semibold tracking-tight text-white'
    : 'text-lg font-semibold tracking-tight text-slate-900';

  const taglineClass = isExperience
    ? 'hidden sm:block text-xs text-slate-400'
    : 'hidden sm:block text-xs text-slate-500';

  const menuButtonClass = isExperience
    ? 'md:hidden inline-flex items-center rounded-md border border-slate-600 px-3 py-1.5 text-sm text-slate-200 hover:border-slate-400'
    : 'md:hidden inline-flex items-center rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-slate-400';

  const mobileNavClass = isExperience
    ? 'md:hidden border-b border-slate-800 bg-slate-950'
    : 'md:hidden border-b border-slate-200 bg-white';

  const footerClass = isExperience
    ? 'border-t border-slate-800 bg-slate-950'
    : 'border-t border-slate-200 bg-slate-50';

  function navClass({ isActive }) {
    if (isExperience) {
      return [
        'px-3 py-1.5 rounded-md transition-colors',
        isActive
          ? 'text-sky-300 bg-sky-500/10'
          : 'text-slate-300 hover:text-sky-300 hover:bg-sky-500/10',
      ].join(' ');
    }
    return [
      'px-3 py-1.5 rounded-md transition-colors',
      isActive
        ? 'text-sky-600 bg-sky-50'
        : 'text-slate-600 hover:text-sky-600 hover:bg-sky-50',
    ].join(' ');
  }

  function mobileNavLinkClass({ isActive }) {
    if (isExperience) {
      return [
        'block px-3 py-2 rounded-md text-sm transition-colors',
        isActive
          ? 'text-sky-300 bg-sky-500/10'
          : 'text-slate-300 hover:text-sky-300 hover:bg-sky-500/10',
      ].join(' ');
    }
    return [
      'block px-3 py-2 rounded-md text-sm transition-colors',
      isActive
        ? 'text-sky-600 bg-sky-50'
        : 'text-slate-600 hover:text-sky-600 hover:bg-sky-50',
    ].join(' ');
  }

  return (
    <div className={shellClass}>
      <header className={headerClass}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={brandLogo}
              alt="Signal Bridge"
              className="h-9 w-9 rounded-md object-contain bg-black"
              width={36}
              height={36}
            />
            <div>
              <div className={brandClass}>Signal Bridge™</div>
              <div className={taglineClass}>
                Defense-first alert delivery for military, schools, and critical infrastructure
              </div>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={navClass}
                end={item.to === '/'}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <button
            type="button"
            className={menuButtonClass}
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
          >
            Menu
          </button>
        </div>
      </header>
      {mobileOpen && (
        <nav id="mobile-nav" className={mobileNavClass}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-2 grid gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={mobileNavLinkClass}
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
        <div
          className={
            isExperience ? 'w-full' : 'mx-auto max-w-7xl px-4 sm:px-6 py-10'
          }
        >
          {children}
        </div>
      </main>
      <footer className={footerClass}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 text-xs text-slate-500 flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-4">
          <span>© {new Date().getFullYear()} Signal Bridge™.</span>
          <span>Built for schools, public safety, health, and defense teams.</span>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
