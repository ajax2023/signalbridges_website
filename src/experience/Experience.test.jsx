import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Experience from '../pages/Experience';
import ExperienceHeader from '../layout/ExperienceHeader';
import { PROGRESS_STORAGE_KEY } from './learning/progress';

function installStorage() {
  const store = new Map();
  vi.stubGlobal('localStorage', {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => {
      store.set(key, String(value));
    },
    removeItem: (key) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  });
}

function renderExperience() {
  return render(<Experience />);
}

describe('experience learning page', () => {
  beforeEach(() => {
    installStorage();
    vi.useFakeTimers();
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('starts on Buttons & Actions without completed results or progress', () => {
    renderExperience();
    expect(screen.getByRole('heading', { level: 1, name: 'Buttons & Actions' })).toBeTruthy();
    expect(screen.getByText('0 of 9 modules completed')).toBeTruthy();
    expect(screen.queryByText(/Calling security/)).toBeNull();
    expect(screen.getByRole('button', { name: 'Replay' }).disabled).toBe(true);
    expect(screen.getByRole('status').textContent).toMatch(/Ready/);
  });

  it('navigates between modules without counting a visit as completion', () => {
    renderExperience();
    fireEvent.click(screen.getByRole('button', { name: /External Events & Sensors/i }));
    expect(screen.getByRole('heading', { level: 1, name: 'External Events & Sensors' })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Water leak/i })).toBeTruthy();
    expect(screen.getByText('0 of 9 modules completed')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /IoT Devices/i }));
    expect(screen.getByRole('button', { name: /Shelly input/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Bluetooth presence/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /MQTT message/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Gateway offline/i })).toBeTruthy();
    expect(document.body.textContent).not.toMatch(/Sidewalk/i);
    expect(document.body.textContent).not.toMatch(/Ring sensor|Amazon Ring/i);
    expect(screen.getByText('0 of 9 modules completed')).toBeTruthy();
  });

  it('runs a button scenario through the timeline, then replays and resets', () => {
    renderExperience();
    fireEvent.click(screen.getByRole('button', { name: /Emergency Button/i }));

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(document.querySelector('[data-step="received"]').getAttribute('data-state')).not.toBe('idle');
    expect(document.querySelector('[data-step="completed"]').getAttribute('data-state')).toBe('idle');
    expect(screen.queryByText(/Calling security/)).toBeNull();

    act(() => {
      vi.runAllTimers();
    });

    expect(screen.getByRole('status').textContent).toMatch(/Completed Emergency Button/);
    expect(screen.getByText(/Calling security/)).toBeTruthy();
    expect(screen.getByText('Strobe Activated')).toBeTruthy();
    expect(screen.queryByText('SMS Notification')).toBeNull();
    expect(screen.getByText('1 of 9 modules completed')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Replay' }));
    expect(screen.getByRole('status').textContent).toMatch(/Running/);

    act(() => {
      vi.runAllTimers();
    });
    expect(screen.getByRole('status').textContent).toMatch(/Completed/);

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByRole('status').textContent).toMatch(/Ready/);
    expect(screen.queryByText(/Calling security/)).toBeNull();
  });

  it('changes outcomes when a different scenario is selected', () => {
    renderExperience();
    fireEvent.click(screen.getByRole('tab', { name: /Multi-Channel/i }));
    fireEvent.click(screen.getByRole('button', { name: /Emergency Button/i }));
    act(() => {
      vi.runAllTimers();
    });
    expect(screen.getByText('SMS Notification')).toBeTruthy();
    expect(screen.getByText('Display Message')).toBeTruthy();
    expect(screen.queryByText('Strobe Activated')).toBeNull();
  });

  it('persists completion across a new visit', () => {
    const first = renderExperience();
    fireEvent.click(screen.getByRole('button', { name: /Help Button/i }));
    act(() => {
      vi.runAllTimers();
    });
    expect(screen.getByText('1 of 9 modules completed')).toBeTruthy();
    const stored = JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY));
    expect(stored.modules.A.events).toContain('help');
    first.unmount();

    renderExperience();
    expect(screen.getByText('1 of 9 modules completed')).toBeTruthy();
  });

  it('completes a reduced-motion run without a long wait', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query) => ({
        matches: String(query).includes('prefers-reduced-motion'),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
    renderExperience();
    fireEvent.click(screen.getByRole('button', { name: /Door Button/i }));
    act(() => {
      vi.advanceTimersByTime(30);
    });
    expect(screen.getByRole('status').textContent).toMatch(/Completed Door Button/);
    expect(document.querySelector('[data-step="completed"]').getAttribute('data-state')).toBe('done');
  });

  it('runs a simulated flow from module I', () => {
    renderExperience();
    fireEvent.click(screen.getByRole('button', { name: /Bring everything together/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Run flow' }));
    act(() => {
      vi.runAllTimers();
    });
    expect(screen.getByRole('status').textContent).toMatch(/Completed Button press/);
    expect(screen.getByText('1 of 9 modules completed')).toBeTruthy();
  });

  it('stacks on small screens and keeps the module list collapsible', () => {
    renderExperience();
    const toggle = screen.getByRole('button', { name: 'Open learning modules' });
    expect(toggle.className).toContain('xl:hidden');
    const nav = screen.getByRole('navigation', { name: 'Learning modules' });
    expect(nav.className).toContain('hidden');
    expect(nav.className).toContain('xl:flex');
    fireEvent.click(toggle);
    expect(screen.getByRole('navigation', { name: 'Learning modules' }).className).not.toContain('hidden');
    const stage = document.querySelector('[aria-busy]');
    expect(stage.className).toContain('grid-cols-1');
    expect(stage.className).toContain('lg:grid-cols-3');
    expect(document.querySelector('.sb-learn').className).toContain('overflow-hidden');
  });

  it('keeps sound off until the visitor turns it on', () => {
    renderExperience();
    const sound = screen.getByRole('button', { name: 'Sound off' });
    expect(sound.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(sound);
    expect(screen.getByRole('button', { name: 'Sound on' }).getAttribute('aria-pressed')).toBe('true');
  });
});

describe('experience header', () => {
  it('links the marketing navigation to existing pages', () => {
    render(
      <MemoryRouter initialEntries={['/experience']}>
        <ExperienceHeader />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: 'Product' }).getAttribute('href')).toBe('/product');
    expect(screen.getByRole('link', { name: 'Interactive Demo' }).getAttribute('href')).toBe('/experience');
    expect(screen.getByRole('link', { name: 'Resources' }).getAttribute('href')).toBe('/downloads');
    expect(screen.getByRole('link', { name: 'Pricing' }).getAttribute('href')).toBe('/contact?topic=pricing');
    expect(screen.getByRole('link', { name: 'Request a Demo' }).getAttribute('href')).toBe('/contact?topic=demo');

    fireEvent.click(screen.getByRole('button', { name: 'Solutions' }));
    expect(screen.getByRole('menuitem', { name: 'Reliability' }).getAttribute('href')).toBe('/reliability');
    expect(screen.getByRole('menuitem', { name: 'Security' }).getAttribute('href')).toBe('/security');
  });
});
