import { useEffect } from 'react';

function HelpRedirect() {
  useEffect(() => {
    window.location.replace('https://support.signalbridges.com');
  }, []);

  return (
    <section className="max-w-xl space-y-3">
      <h1 className="text-2xl font-semibold tracking-tight">Redirecting to support.signalbridges.com</h1>
      <p className="text-sm text-slate-300">
        If you are not redirected automatically, you can open the help center
        using the link below.
      </p>
      <a
        href="https://support.signalbridges.com"
        className="inline-flex items-center justify-center rounded-md bg-sky-500 px-4 py-2 text-xs font-medium text-slate-950 hover:bg-sky-400"
      >
        Open support.signalbridges.com
      </a>
    </section>
  );
}

export default HelpRedirect;
