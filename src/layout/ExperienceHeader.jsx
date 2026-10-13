import { useState } from 'react';
import { NavLink } from 'react-router-dom';
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

const linkClass = ({ isActive }, to) => [
  'rounded-md px-3 py-1.5 transition-colors',
  isActive
    ? 'bg-sky-50 text-sky-600'
    : to === '/experience'
      ? 'font-semibold text-sky-600 hover:bg-sky-50 hover:text-sky-700'
      : 'text-slate-600 hover:bg-sky-50 hover:text-sky-600',
].join(' ');

const mobileLinkClass = ({ isActive }, to) => [
  'block rounded-md px-3 py-2 text-sm transition-colors',
  isActive
    ? 'bg-sky-50 text-sky-600'
    : to === '/experience'
      ? 'font-semibold text-sky-600 hover:bg-sky-50 hover:text-sky-700'
      : 'text-slate-600 hover:bg-sky-50 hover:text-sky-600',
].join(' ');

function ExperienceHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="z-40 shrink-0 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <NavLink
          to="/"
          className="flex items-center gap-3 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          <img
            src={brandLogo}
            alt="Signal Bridge"
            className="h-9 w-9 object-contain"
            width={36}
            height={36}
          />
          <span>
            <span className="block text-lg font-semibold tracking-tight text-slate-900">Signal Bridge™</span>
            <span className="hidden text-xs text-slate-500 sm:block">
              Connecting events, communications, and devices.
            </span>
          </span>
        </NavLink>

        <nav className="hidden items-center gap-1 text-sm font-medium md:flex" aria-label="Primary">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={(state) => linkClass(state, item.to)}
              end={item.to === '/'}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-slate-400 md:hidden"
          aria-expanded={mobileOpen}
          aria-controls="experience-mobile-nav"
          onClick={() => setMobileOpen((value) => !value)}
        >
          Menu
        </button>
      </div>
      {mobileOpen && (
        <nav id="experience-mobile-nav" className="border-b border-slate-200 bg-white md:hidden" aria-label="Primary mobile">
          <div className="mx-auto grid max-w-7xl gap-1 px-4 py-2 sm:px-6">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={(state) => mobileLinkClass(state, item.to)}
                end={item.to === '/'}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

export default ExperienceHeader;
