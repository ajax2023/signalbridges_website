import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import brandLogo from '../assets/signal-bridge-console.png';

const linkClass = ({ isActive }) =>
  [
    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
    isActive ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900',
  ].join(' ');

function SolutionsMenu({ onNavigate }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function onPointer(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }
    function onKey(event) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((value) => !value)}
      >
        Solutions
      </button>
      {open && (
        <div
          role="menu"
          aria-label="Solutions"
          className="absolute left-0 top-full z-50 mt-1 w-48 rounded-xl border border-slate-200 bg-white p-1 shadow-lg"
        >
          <NavLink
            role="menuitem"
            to="/reliability"
            className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            onClick={() => {
              setOpen(false);
              onNavigate?.();
            }}
          >
            Reliability
          </NavLink>
          <NavLink
            role="menuitem"
            to="/security"
            className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            onClick={() => {
              setOpen(false);
              onNavigate?.();
            }}
          >
            Security
          </NavLink>
        </div>
      )}
    </div>
  );
}

function ExperienceHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[90rem] items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <NavLink to="/" className="flex min-w-0 items-center gap-2.5 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
          <img src={brandLogo} alt="" className="h-9 w-9 object-contain" width={36} height={36} />
          <span className="truncate text-lg font-bold tracking-tight text-slate-900">Signal Bridge</span>
          <span className="hidden text-sm font-medium text-blue-600 lg:inline">Connect. Notify. Protect.</span>
        </NavLink>

        <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Primary">
          <NavLink to="/product" className={linkClass}>
            Product
          </NavLink>
          <SolutionsMenu />
          <NavLink to="/experience" className={linkClass}>
            Interactive Demo
          </NavLink>
          <NavLink to="/downloads" className={linkClass}>
            Resources
          </NavLink>
          <NavLink to="/contact?topic=pricing" className={linkClass}>
            Pricing
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <NavLink
            to="/contact?topic=demo"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:px-4"
            aria-label="Request a Demo"
          >
            <span className="sm:hidden">Demo</span>
            <span className="hidden sm:inline">Request a Demo</span>
          </NavLink>
          <button
            type="button"
            className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 xl:hidden"
            aria-expanded={mobileOpen}
            aria-controls="experience-mobile-nav"
            onClick={() => setMobileOpen((value) => !value)}
          >
            Menu
          </button>
        </div>
      </div>
      {mobileOpen && (
        <nav id="experience-mobile-nav" className="border-t border-slate-200 bg-white xl:hidden" aria-label="Primary mobile">
          <div className="mx-auto grid max-w-[90rem] gap-1 px-4 py-3 sm:px-6">
            <NavLink to="/product" className={linkClass} onClick={() => setMobileOpen(false)}>
              Product
            </NavLink>
            <NavLink to="/reliability" className={linkClass} onClick={() => setMobileOpen(false)}>
              Solutions · Reliability
            </NavLink>
            <NavLink to="/security" className={linkClass} onClick={() => setMobileOpen(false)}>
              Solutions · Security
            </NavLink>
            <NavLink to="/experience" className={linkClass} onClick={() => setMobileOpen(false)}>
              Interactive Demo
            </NavLink>
            <NavLink to="/downloads" className={linkClass} onClick={() => setMobileOpen(false)}>
              Resources
            </NavLink>
            <NavLink to="/contact?topic=pricing" className={linkClass} onClick={() => setMobileOpen(false)}>
              Pricing
            </NavLink>
          </div>
        </nav>
      )}
    </header>
  );
}

export default ExperienceHeader;
