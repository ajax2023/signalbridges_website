import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function LegalPage({ title, summary, children }) {
  useEffect(() => {
    const previous = document.title;
    document.title = `${title} | Signal Bridge`;
    window.scrollTo(0, 0);
    return () => {
      document.title = previous;
    };
  }, [title]);

  return (
    <article className="mx-auto max-w-3xl text-slate-700">
      <header className="mb-10 border-b border-slate-200 pb-8">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
          Signal Bridge
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 text-base leading-7">{summary}</p>
        <p className="mt-4 text-sm text-slate-500">Effective November 2, 2026</p>
      </header>
      <div className="space-y-8 text-base leading-7 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-slate-900 [&_p+p]:mt-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_a]:text-blue-600 [&_a]:underline [&_a]:underline-offset-2 [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-sm">
        {children}
      </div>
      <nav
        aria-label="Legal pages"
        className="mt-10 flex flex-wrap gap-5 border-t border-slate-200 pt-6 text-sm text-blue-600"
      >
        <Link to="/privacy" className="underline">
          Privacy policy
        </Link>
        <Link to="/tos" className="underline">
          Terms of service
        </Link>
        <Link to="/" className="underline">
          Back to overview
        </Link>
      </nav>
    </article>
  );
}
