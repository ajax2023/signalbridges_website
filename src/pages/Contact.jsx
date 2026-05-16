import { useState } from 'react';

const fieldClassName =
  'w-full min-w-[220px] rounded-md border border-slate-700 bg-slate-900/40 px-3 py-2 text-sm text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500';

function Contact() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <section className="space-y-6 max-w-3xl">
      <div className="space-y-2.5">
        <p className="text-[0.6rem] font-semibold tracking-[0.25em] text-sky-400/80 uppercase">
          Contact
        </p>
        <h1 className="text-3xl font-semibold tracking-tight leading-snug sm:text-4xl">
          Talk with the Signal Bridge™ team.
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          Share a bit about your environment and what you need from an alerting
          platform. We will use this information to route your request to the
          right person.
        </p>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 space-y-2">
        <p className="text-xs font-semibold text-slate-300">Deployment discussions may include:</p>
        <ul className="space-y-1 text-xs text-slate-400">
          <li className="flex items-start gap-2"><span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-sky-500/60" />Paging topology review</li>
          <li className="flex items-start gap-2"><span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-sky-500/60" />Agent placement guidance</li>
          <li className="flex items-start gap-2"><span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-sky-500/60" />SIP integration planning</li>
          <li className="flex items-start gap-2"><span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-sky-500/60" />Offline operation requirements</li>
          <li className="flex items-start gap-2"><span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-sky-500/60" />Security boundary review</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-slate-800 bg-slate-900/40 p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1 text-sm">
            <label htmlFor="name" className="block text-slate-200">
              Name
            </label>
            <input id="name" name="name" type="text" required className={fieldClassName} />
          </div>
          <div className="space-y-1 text-sm">
            <label htmlFor="email" className="block text-slate-200">
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
            <label htmlFor="organization" className="block text-slate-200">
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
            <label htmlFor="role" className="block text-slate-200">
              Role
            </label>
            <input id="role" name="role" type="text" className={fieldClassName} />
          </div>
          <div className="space-y-1 text-sm">
            <label htmlFor="region" className="block text-slate-200">
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
            <label htmlFor="environment" className="block text-slate-200">
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
          <label htmlFor="details" className="block text-slate-200">
            What are you hoping to solve with Signal Bridge™?
          </label>
          <textarea
            id="details"
            name="details"
            rows={4}
            className={fieldClassName}
          />
        </div>

        <div className="flex items-center justify-between gap-4 pt-2 text-xs text-slate-400">
          <p>
            By submitting this form you agree to be contacted about Signal Bridge™. No
            marketing lists by default.
          </p>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md bg-sky-500 px-4 py-2 text-xs font-medium text-slate-950 hover:bg-sky-400"
          >
            Request follow-up
          </button>
        </div>

        {submitted && (
          <p className="pt-2 text-xs text-sky-300">
            Your request has been received. A member of the Signal Bridge™ team
            will follow up directly.
          </p>
        )}
      </form>
    </section>
  );
}

export default Contact;
