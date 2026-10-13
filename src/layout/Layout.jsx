import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import brandLogo from '../assets/signal-bridge-console.png';
import ExperienceHeader from './ExperienceHeader';

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
    ? 'flex h-dvh flex-col overflow-hidden bg-[#f4f7fb] text-slate-900'
    : 'min-h-screen flex flex-col bg-white text-slate-900';

  const headerClass = 'border-b border-slate-200 bg-white';
  const brandClass = 'whitespace-nowrap text-lg font-semibold tracking-tight text-slate-900';
  const taglineClass = 'hidden lg:block text-xs text-slate-500';
  const menuButtonClass =
    'lg:hidden inline-flex items-center rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-slate-400';
  const mobileNavClass = 'lg:hidden border-b border-slate-200 bg-white';
  const footerClass = 'border-t border-slate-200 bg-slate-50';

  function navClass({ isActive }, to) {
    const isExperienceLink = to === '/experience';
    return [
      'px-3 py-1.5 rounded-md transition-colors',
      isActive
        ? 'text-sky-600 bg-sky-50'
        : isExperienceLink
          ? 'font-semibold text-sky-600 hover:text-sky-700 hover:bg-sky-50'
          : 'text-slate-600 hover:text-sky-600 hover:bg-sky-50',
    ].join(' ');
  }

  function mobileNavLinkClass({ isActive }, to) {
    const isExperienceLink = to === '/experience';
    return [
      'block px-3 py-2 rounded-md text-sm transition-colors',
      isActive
        ? 'text-sky-600 bg-sky-50'
        : isExperienceLink
          ? 'font-semibold text-sky-600 hover:text-sky-700 hover:bg-sky-50'
          : 'text-slate-600 hover:text-sky-600 hover:bg-sky-50',
    ].join(' ');
  }

  return (
    <div className={shellClass}>
      {isExperience ? (
        <ExperienceHeader />
      ) : (
      <header className={headerClass}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={brandLogo}
              alt="Signal Bridge"
              className="h-9 w-9 object-contain"
              width={36}
              height={36}
            />
            <div>
              <div className={brandClass}>Signal Bridge™</div>
              <div className={taglineClass}>
                Connecting events, communications, and devices.
              </div>
            </div>
          </div>
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={(state) => navClass(state, item.to)}
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
      )}
      {mobileOpen && !isExperience && (
        <nav id="mobile-nav" className={mobileNavClass}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-2 grid gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={(state) => mobileNavLinkClass(state, item.to)}
                end={item.to === '/'}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
      <main className={isExperience ? 'flex min-h-0 flex-1 flex-col' : 'flex-1'}>
        <div
          className={
            isExperience ? 'min-h-0 w-full flex-1' : 'mx-auto max-w-7xl px-4 sm:px-6 py-10'
          }
        >
          {children}
        </div>
      </main>
      {!isExperience && (
      <footer className={footerClass}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 text-xs text-slate-500 flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-4">
          <span>© {new Date().getFullYear()} Signal Bridge™.</span>
          <span>Built for schools, public safety, health, and defense teams.</span>
        </div>
      </footer>
      )}
    </div>
  );
}

export default Layout;
