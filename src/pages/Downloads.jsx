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
  return (
    <span
      className={`h-${size} w-${size} animate-spin rounded-full border-2 border-current border-t-transparent`}
    />
  );
}

function ReleaseCard({ release, onDownload, downloading }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-5 flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-semibold text-slate-100">{release.displayName}</h2>
        <p className="mt-1 text-xs text-slate-400 leading-relaxed">{release.description}</p>
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs">
        <div>
          <dt className="text-[0.6rem] font-semibold tracking-[0.2em] text-slate-500 uppercase mb-0.5">Version</dt>
          <dd className="font-mono text-slate-200">{release.version || '—'}</dd>
        </div>
        <div>
          <dt className="text-[0.6rem] font-semibold tracking-[0.2em] text-slate-500 uppercase mb-0.5">Size</dt>
          <dd className="text-slate-200">{formatBytes(release.sizeBytes)}</dd>
        </div>
        <div>
          <dt className="text-[0.6rem] font-semibold tracking-[0.2em] text-slate-500 uppercase mb-0.5">Released</dt>
          <dd className="text-slate-200">{formatDate(release.releaseDate)}</dd>
        </div>
        <div>
          <dt className="text-[0.6rem] font-semibold tracking-[0.2em] text-slate-500 uppercase mb-0.5">Platform</dt>
          <dd className="text-slate-200 capitalize">{release.platform || '—'}</dd>
        </div>
        {release.sha256 && (
          <div className="col-span-2">
            <dt className="text-[0.6rem] font-semibold tracking-[0.2em] text-slate-500 uppercase mb-0.5">SHA-256</dt>
            <dd className="font-mono text-[0.65rem] text-slate-400 break-all leading-relaxed">{release.sha256}</dd>
          </div>
        )}
      </dl>

      {release.notes && (
        <p className="text-xs text-slate-500 leading-relaxed border-t border-slate-800/60 pt-3">
          {release.notes}
        </p>
      )}

      <div className="mt-auto pt-1">
        <button
          type="button"
          onClick={() => onDownload(release)}
          disabled={downloading}
          className="inline-flex items-center gap-2 rounded-md bg-sky-500 px-4 py-2 text-xs font-medium text-slate-950 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
    </div>
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
        const data = await res.json();
        if (!cancelled) setReleases(data.releases ?? []);
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
      const { downloadUrl } = await res.json();
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setDownloadError(err.message);
    } finally {
      setDownloading(null);
    }
  }, [user]);

  const PageHeader = (
    <div className="max-w-2xl space-y-2.5">
      <p className="text-[0.6rem] font-semibold tracking-[0.25em] text-sky-400/80 uppercase">Software</p>
      <h1 className="text-3xl font-semibold tracking-tight leading-snug sm:text-4xl">
        Operator console and on-premise agent.
      </h1>
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
        <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
          Signal Bridge™ components are distributed directly during technical
          review and deployment evaluation engagements.
        </p>
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6 max-w-sm space-y-4">
          <div>
            <p className="text-sm font-semibold text-slate-100">Sign in to access downloads</p>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Installer access is restricted to authorized evaluation participants.
            </p>
          </div>
          {signInError && (
            <p className="text-xs text-red-400">{signInError}</p>
          )}
          <button
            type="button"
            onClick={handleSignIn}
            disabled={signingIn}
            className="inline-flex items-center justify-center gap-2.5 w-full rounded-md border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm font-medium text-slate-100 hover:border-slate-500 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
          <span className="text-xs text-slate-400 truncate max-w-[200px]">{user.email}</span>
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center rounded-md border border-slate-700/60 px-3 py-1.5 text-xs text-slate-400 hover:border-slate-500 hover:text-slate-200 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>

      {downloadError && (
        <div className="rounded-md border border-red-900/40 bg-red-950/20 px-4 py-3 text-xs text-red-300 max-w-2xl">
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
        <div className="rounded-md border border-red-900/40 bg-red-950/20 px-4 py-3 text-xs text-red-300 max-w-2xl">
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

      <p className="text-xs text-slate-500 max-w-2xl leading-relaxed border-t border-slate-800/60 pt-4">
        Production evaluation builds are distributed to authorized participants only.
        Download links expire after 15 minutes and are not transferable.
      </p>
    </section>
  );
}

export default Downloads;
