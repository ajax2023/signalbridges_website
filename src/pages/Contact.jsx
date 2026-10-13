import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const fieldClassName =
  'w-full min-w-[220px] rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20';

function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [searchParams] = useSearchParams();
  const topic = searchParams.get('topic');

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <section className="space-y-8">
      <div className="space-y-4">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-600">
          Contact
        </p>
        <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">
          Talk with the Signal Bridge™ team.
        </h1>
        <div className="w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 shadow-sm">
          <p className="text-base leading-relaxed text-slate-700">
            Share a bit about your environment and what you need from an alerting
            platform. We will use this information to route your request to the
            right person.
          </p>
          {topic === 'pricing' && (
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              You are asking about pricing. Describe your sites and we will follow up with options for your deployment.
            </p>
          )}
          {topic === 'demo' && (
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              You are requesting a demo. Tell us about your environment and we will schedule time with the right person.
            </p>
          )}
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_1.5fr]">
        <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">01</span>
          <h2 className="mt-5 text-xl font-bold text-slate-900">Deployment discussions may include</h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
            {[
              'Paging topology review',
              'Agent placement guidance',
              'SIP integration planning',
              'Offline operation requirements',
              'Security boundary review',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Your environment</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">Request a follow-up</h2>
          </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1 text-sm">
            <label htmlFor="name" className="block font-semibold text-slate-700">
              Name
            </label>
            <input id="name" name="name" type="text" required className={fieldClassName} />
          </div>
          <div className="space-y-1 text-sm">
            <label htmlFor="email" className="block font-semibold text-slate-700">
              Work email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className={fieldClassName}
            />
          </div>
          <div className="space-y-1 text-sm">
            <label htmlFor="organization" className="block font-semibold text-slate-700">
              Organization
            </label>
            <input
              id="organization"
              name="organization"
              type="text"
              required
              className={fieldClassName}
            />
          </div>
          <div className="space-y-1 text-sm">
            <label htmlFor="role" className="block font-semibold text-slate-700">
              Role
            </label>
            <input id="role" name="role" type="text" className={fieldClassName} />
          </div>
          <div className="space-y-1 text-sm">
            <label htmlFor="region" className="block font-semibold text-slate-700">
              Region
            </label>
            <select id="region" name="region" className={fieldClassName}>
              <option value="">Select a region</option>
              <option value="na">North America</option>
              <option value="eu">Europe</option>
              <option value="apac">Asia Pacific</option>
              <option value="latam">Latin America</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="space-y-1 text-sm">
            <label htmlFor="environment" className="block font-semibold text-slate-700">
              Environment type
            </label>
            <select id="environment" name="environment" className={fieldClassName}>
              <option value="">Select an environment</option>
              <option value="school">Schools / universities</option>
              <option value="public-safety">Police / public safety</option>
              <option value="health">Hospitals / health systems</option>
              <option value="defense">Defense / federal</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="space-y-1 text-sm">
          <label htmlFor="details" className="block font-semibold text-slate-700">
            What are you hoping to solve with Signal Bridge™?
          </label>
          <textarea
            id="details"
            name="details"
            rows={4}
            className={fieldClassName}
          />
        </div>

        <div className="flex flex-col items-start justify-between gap-4 pt-2 text-xs leading-relaxed text-slate-500 sm:flex-row sm:items-center">
          <p>
            By submitting this form you agree to be contacted about Signal Bridge™. No
            marketing lists by default.
          </p>
          <button
            type="submit"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-500"
          >
            Request follow-up
          </button>
        </div>

        {submitted && (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
            Your request has been received. A member of the Signal Bridge™ team
            will follow up directly.
          </p>
        )}
        </form>
      </div>
    </section>
  );
}

export default Contact;
