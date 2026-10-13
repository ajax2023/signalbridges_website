import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';

const authState = vi.hoisted(() => ({
  user: {
    email: 'evaluator@example.com',
    getIdToken: vi.fn().mockResolvedValue('test-token'),
  },
}));

vi.mock('../firebase', () => ({
  auth: {},
  googleProvider: {},
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: (_auth, callback) => {
    callback(authState.user);
    return vi.fn();
  },
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
}));

import Downloads from './Downloads';

describe('downloads page', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          console: {
            version: '1.2.3',
            sha256: 'console-sha',
            sizeBytes: 10485760,
            releaseDate: '2026-10-01T00:00:00.000Z',
            filename: 'console.exe',
          },
          runtime: {
            version: '2.3.4',
            sha256: 'agent-sha',
            sizeBytes: 5242880,
            releaseDate: '2026-10-02T00:00:00.000Z',
            filename: 'agent.exe',
          },
        },
      }),
    }));
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('keeps authenticated release metadata and clearly distinguishes both installers', async () => {
    render(<Downloads />);

    expect(await screen.findByRole('heading', { name: 'Signal Bridge Console' })).toBeTruthy();
    expect(screen.getByText('Operator interface and Signal Bridge workspace.')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Signal Bridge Edge Agent' })).toBeTruthy();
    expect(screen.getByText('Local connectivity, device control, RTP paging, and supported offline operations.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Download Console installer' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Download Edge Agent installer' })).toBeTruthy();
    expect(screen.getByText('console-sha')).toBeTruthy();
    expect(screen.getByText('agent-sha')).toBeTruthy();
    expect(screen.getByText('10.0 MB')).toBeTruthy();
    expect(screen.getByText('5.0 MB')).toBeTruthy();
    expect(screen.getByText(/does not create a tenant/i)).toBeTruthy();

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/api\/downloads\/releases$/), {
        headers: { Authorization: 'Bearer test-token' },
      });
    });
  });
});
