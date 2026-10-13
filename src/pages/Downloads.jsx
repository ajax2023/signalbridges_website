import { useState, useEffect, useCallback } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

function formatBytes(bytes) {
  if (!bytes) return '—';
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-CA');
}

const ERROR_MESSAGES = {
  not_authenticated: 'Your session has expired. Please sign out and sign in again.',
  not_authorized: 'Your account is not authorized to download installers. Contact your administrator.',
  not_available: 'No installer is currently available for this platform.',
  server_error: 'Download is temporarily unavailable. Please try again shortly.',
};

function errorText(code) {
  return ERROR_MESSAGES[code] || 'An unexpected error occurred.';
}

function Spinner({ size = 3 }) {
  const dimensions = size === 4 ? 'h-4 w-4' : 'h-3 w-3';

  return (
    <span
      className={`${dimensions} animate-spin rounded-full border-2 border-current border-t-transparent`}
    />
  );
}

function ReleaseCard({ release, onDownload, downloading }) {
  return (
    <article className="flex flex-col gap-5 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
      <div>
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600" aria-hidden="true">
          <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M16 4v16M10 14l6 6 6-6M6 25h20" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <h2 className="mt-4 text-xl font-bold text-slate-900">{release.displayName}</h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-500">{release.description}</p>
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
        <div>
          <dt className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Version</dt>
          <dd className="font-mono text-slate-700">{release.version || '—'}</dd>
        </div>
        <div>
          <dt className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Size</dt>
          <dd className="text-slate-700">{formatBytes(release.sizeBytes)}</dd>
        </div>
        <div>
          <dt className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Released</dt>
          <dd className="text-slate-700">{formatDate(release.releaseDate)}</dd>
        </div>
        <div>
          <dt className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Platform</dt>
          <dd className="capitalize text-slate-700">{release.platform || '—'}</dd>
        </div>
        {release.sha256 && (
          <div className="col-span-2">
            <dt className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">SHA-256</dt>
            <dd className="break-all font-mono text-xs leading-relaxed text-slate-500">{release.sha256}</dd>
          </div>
        )}
      </dl>

      {release.notes && (
        <p className="border-t border-slate-200 pt-4 text-xs leading-relaxed text-slate-500">
          {release.notes}
        </p>
      )}

      <div className="mt-auto pt-1">
        <button
          type="button"
          onClick={() => onDownload(release)}
          disabled={downloading}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {downloading ? (
            <>
              <Spinner size={3} />
              Preparing download…
            </>
          ) : (
            'Download Installer'
          )}
        </button>
      </div>
    </article>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className="flex-shrink-0">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function Downloads() {
  const [user, setUser] = useState(undefined);
  const [releases, setReleases] = useState(null);
  const [releasesLoading, setReleasesLoading] = useState(false);
  const [releasesError, setReleasesError] = useState(null);
  const [downloading, setDownloading] = useState(null);
  const [downloadError, setDownloadError] = useState(null);
  const [signingIn, setSigningIn] = useState(false);
  const [signInError, setSignInError] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u ?? null));
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) {
      setReleases(null);
      setReleasesError(null);
      return;
    }
    let cancelled = false;
    async function fetchReleases() {
      setReleasesLoading(true);
      setReleasesError(null);
      try {
        const token = await user.getIdToken();
        const res = await fetch(`${API_BASE}/api/downloads/releases`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) throw new Error('not_authenticated');
        if (res.status === 403) throw new Error('not_authorized');
        if (!res.ok) throw new Error('server_error');
        const response = await res.json();
        if (!cancelled) {
          // Backend returns { success: true, data: { console: {...}, runtime: {...} } }
          const releaseData = response.data || {};
          const releasesArray = Object.entries(releaseData).map(([type, info]) => ({
            type,
            platform: 'windows',
            displayName: type === 'console' ? 'Signal Bridge Console' : 'Signal Bridge Edge Agent',
            description: type === 'console'
              ? 'Electron-based operator console for dispatch, paging, alert routing, and operational workflows.'
              : 'On-premise execution agent for RTP paging, local device operations, and offline-capable workflows.',
            version: info.version,
            sha256: info.sha256,
            sizeBytes: info.sizeBytes,
            releaseDate: info.releaseDate,
            filename: info.filename,
          }));
          setReleases(releasesArray);
        }
      } catch (err) {
        if (!cancelled) setReleasesError(err.message);
      } finally {
        if (!cancelled) setReleasesLoading(false);
      }
    }
    fetchReleases();
    return () => { cancelled = true; };
  }, [user]);

  const handleSignIn = useCallback(async () => {
    setSignInError(null);
    setSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setSignInError('Sign-in failed. Please try again.');
      }
    } finally {
      setSigningIn(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOut(auth);
    setReleases(null);
    setReleasesError(null);
    setDownloadError(null);
  }, []);

  const handleDownload = useCallback(async (release) => {
    setDownloading(release.type);
    setDownloadError(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch(
        `${API_BASE}/api/downloads/${release.type}/${release.platform}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.status === 401) throw new Error('not_authenticated');
      if (res.status === 403) throw new Error('not_authorized');
      if (res.status === 404) throw new Error('not_available');
      if (!res.ok) throw new Error('server_error');
      const body = await res.json();
      // Support multiple response shapes from backend
      const url =
        body.downloadUrl ||
        body.download_url ||
        body.url ||
        body.data?.url ||
        body.data?.downloadUrl ||
        body.data?.download_url;
      if (!url) {
        console.error('[Downloads] Unrecognized response shape:', body);
        throw new Error('server_error');
      }
      const a = document.createElement('a');
      a.href = url;
      a.download = release.filename || '';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      setDownloadError(err.message);
    } finally {
      setDownloading(null);
    }
  }, [user]);

  const PageHeader = (
    <div className="space-y-4">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-600">Software</p>
      <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">
        Operator console and on-premise agent.
      </h1>
      <div className="w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 shadow-sm">
        <p className="text-base leading-relaxed text-slate-700">
          Signal Bridge™ components are distributed directly during technical
          review and deployment evaluation engagements.
        </p>
      </div>
    </div>
  );

  if (user === undefined) {
    return (
      <section className="space-y-6">
        {PageHeader}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Spinner size={3} />
          Checking session…
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="space-y-6">
        {PageHeader}
        <div className="max-w-md space-y-5 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div>
            <p className="text-lg font-bold text-slate-900">Sign in to access downloads</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">
              Installer access is restricted to authorized evaluation participants.
            </p>
          </div>
          {signInError && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{signInError}</p>
          )}
          <button
            type="button"
            onClick={handleSignIn}
            disabled={signingIn}
            className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {signingIn ? (
              <>
                <Spinner size={4} />
                Signing in…
              </>
            ) : (
              <>
                <GoogleIcon />
                Sign in with Google
              </>
            )}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {PageHeader}
        <div className="flex items-center gap-3 flex-shrink-0 pt-1">
          <span className="max-w-[200px] truncate text-xs text-slate-500">{user.email}</span>
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900"
          >
            Sign out
          </button>
        </div>
      </div>

      {downloadError && (
        <div className="max-w-2xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorText(downloadError)}
        </div>
      )}

      {releasesLoading && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Spinner size={3} />
          Loading available releases…
        </div>
      )}

      {releasesError && !releasesLoading && (
        <div className="max-w-2xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorText(releasesError)}
        </div>
      )}

      {releases && releases.length === 0 && !releasesLoading && (
        <p className="text-xs text-slate-500">No releases are currently available for your account.</p>
      )}

      {releases && releases.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          {releases.map((release) => (
            <ReleaseCard
              key={`${release.type}-${release.platform}`}
              release={release}
              onDownload={handleDownload}
              downloading={downloading === release.type}
            />
          ))}
        </div>
      )}

      <p className="max-w-3xl border-t border-slate-200 pt-4 text-xs leading-relaxed text-slate-500">
        Production evaluation builds are distributed to authorized participants only.
        Download links expire after 15 minutes and are not transferable.
      </p>
    </section>
  );
}

export default Downloads;
