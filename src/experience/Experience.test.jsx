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
    expect(screen.queryByText(/modules completed/)).toBeNull();
    expect(screen.queryByRole('tab', { name: /Basic Alert/i })).toBeNull();
    expect(screen.queryByText(/Calling the help number/)).toBeNull();
    expect(screen.queryByText(/Key Takeaway/)).toBeNull();
    expect(screen.queryByText(/Flow started/)).toBeNull();
    expect(screen.queryByText(/while the flow runs/)).toBeNull();
    expect(screen.getByText(/Press a button. Its one action/)).toBeTruthy();
    expect(screen.getByText('Action running')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Reset' }).disabled).toBe(true);
    expect(screen.getByRole('status').textContent).toMatch(/Ready/);
  });

  it('navigates between modules without counting a visit as completion', () => {
    renderExperience();
    fireEvent.click(screen.getByRole('button', { name: /External Events & Sensors/i }));
    expect(screen.getByRole('heading', { level: 1, name: 'External Events & Sensors' })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Water leak/i }).querySelector('img').getAttribute('src')).toMatch(/WATER/i);
    expect(screen.getByRole('button', { name: /Door opened/i }).querySelector('img').getAttribute('src')).toMatch(/DOOR/i);
    expect(screen.getByRole('button', { name: /High temperature/i }).querySelector('img').getAttribute('src')).toMatch(/TEMPERATURE/i);
    expect(screen.getByRole('button', { name: /Motion detected/i }).querySelector('img').getAttribute('src')).toMatch(/MOTION/i);
    expect(screen.queryByRole('button', { name: /Device offline/i })).toBeNull();
    expect(screen.queryByText(/modules completed/)).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /IoT Devices/i }));
    expect(screen.getByRole('button', { name: /Shelly input/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Bluetooth presence/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /MQTT message/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Gateway offline/i })).toBeTruthy();
    expect(document.body.textContent).not.toMatch(/Sidewalk/i);
    expect(document.body.textContent).not.toMatch(/Ring sensor|Amazon Ring/i);
    expect(screen.queryByText(/Your Progress/i)).toBeNull();
  });

  it('runs a button scenario through the timeline, then replays and resets', () => {
    renderExperience();
    fireEvent.click(screen.getByRole('button', { name: /Call for help/i }));

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(document.querySelector('[data-step="received"]').getAttribute('data-state')).not.toBe('idle');
    expect(document.querySelector('[data-step="completed"]').getAttribute('data-state')).toBe('idle');
    expect(screen.queryByText(/Flow started/)).toBeNull();
    expect(screen.queryByText(/Calling the help number/)).toBeNull();

    act(() => {
      vi.runAllTimers();
    });

    expect(screen.getByRole('status').textContent).toMatch(/Completed Call for help/);
    expect(screen.getAllByText('Calling help number').length).toBeGreaterThan(0);
    expect(screen.getByText(/Calling the help number/)).toBeTruthy();
    expect(screen.queryByText('SMS someone')).toBeNull();
    expect(screen.queryByText(/Try different scenarios/i)).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /Call for help/i }));
    expect(screen.getByRole('status').textContent).toMatch(/Running/);

    act(() => {
      vi.runAllTimers();
    });
    expect(screen.getByRole('status').textContent).toMatch(/Completed/);

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByRole('status').textContent).toMatch(/Ready/);
    expect(screen.queryByText(/Calling the help number/)).toBeNull();
    expect(screen.getByRole('button', { name: /Call for help/i }).textContent).not.toMatch(/Completed/);
  });

  it('persists completion across a new visit', () => {
    const first = renderExperience();
    fireEvent.click(screen.getByRole('button', { name: /Message someone/i }));
    act(() => {
      vi.runAllTimers();
    });
    expect(screen.getByRole('button', { name: /Message someone/i }).textContent).toMatch(/Completed/);
    const stored = JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY));
    expect(stored.modules.A.events).toContain('message-someone');
    first.unmount();

    const second = renderExperience();
    expect(screen.getByRole('button', { name: /Message someone/i }).textContent).toMatch(/Completed/);
    expect(screen.getByRole('button', { name: 'Reset' }).disabled).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByRole('button', { name: /Message someone/i }).textContent).not.toMatch(/Completed/);
    expect(JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY)).modules.A).toBeUndefined();
    second.unmount();
  });

  it('clears completion marks on every module', () => {
    renderExperience();
    fireEvent.click(screen.getByRole('button', { name: /Call for help/i }));
    act(() => {
      vi.runAllTimers();
    });
    fireEvent.click(screen.getByRole('button', { name: /One event. Several steps/i }));
    fireEvent.click(screen.getByRole('button', { name: /Water Leak Response/i }));
    act(() => {
      vi.runAllTimers();
    });
    expect(screen.getByRole('button', { name: /Water Leak Response/i }).textContent).toMatch(/Completed/);

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByRole('button', { name: /Water Leak Response/i }).textContent).not.toMatch(/Completed/);
    expect(screen.getByRole('button', { name: /One event. Several steps/i }).textContent).toMatch(/Not completed/);

    fireEvent.click(screen.getByRole('button', { name: /Buttons & Actions/i }));
    expect(screen.getByRole('button', { name: /Call for help/i }).textContent).not.toMatch(/Completed/);
    expect(JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY)).modules).toEqual({});
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
    fireEvent.click(screen.getByRole('button', { name: /Email someone/i }));
    act(() => {
      vi.advanceTimersByTime(30);
    });
    expect(screen.getByRole('status').textContent).toMatch(/Completed Email someone/);
    expect(document.querySelector('[data-step="completed"]').getAttribute('data-state')).toBe('done');
  });

  it('runs a water-leak flow and shows each step before its action', () => {
    renderExperience();
    fireEvent.click(screen.getByRole('button', { name: /One event. Several steps/i }));
    expect(screen.getByRole('heading', { level: 1, name: 'Flows' })).toBeTruthy();
    expect(screen.getByText('Choose a flow to see its steps.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Water Leak Response/i }));
    expect(screen.getByText('Send SMS to maintenance')).toBeTruthy();
    expect(screen.queryByText('If none, call supervisor')).toBeNull();
    act(() => {
      vi.advanceTimersByTime(360);
    });
    expect(screen.getByText('If none, call supervisor')).toBeTruthy();
    expect(screen.getByRole('contentinfo').textContent).toMatch(/Demonstration only/);
    expect(screen.queryByText(/^Simulation —/)).toBeNull();
    act(() => {
      vi.runAllTimers();
    });
    expect(screen.getByRole('status').textContent).toMatch(/Completed Water Leak Response/);
    expect(screen.getByText('SMS to maintenance')).toBeTruthy();
    expect(screen.getByText('Call supervisor')).toBeTruthy();
    expect(screen.getAllByText('Activate strobe').length).toBeGreaterThan(0);
    expect(screen.queryByText(/Flow started/)).toBeNull();
  });

  it('runs a simulated flow from the flow builder', () => {
    renderExperience();
    fireEvent.click(screen.getByRole('button', { name: /Bring everything together/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Run flow' }));
    act(() => {
      vi.runAllTimers();
    });
    expect(screen.getByRole('status').textContent).toMatch(/Completed Button press/);
    expect(screen.queryByText(/Your Progress/i)).toBeNull();
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
    expect(document.querySelector('[aria-label="Event"] .grid').className).toContain('grid-cols-2');
    expect(screen.getByRole('button', { name: /Call for help/i }).querySelector('img').getAttribute('src')).toMatch(/Phone%20Call/);
    expect(document.querySelector('.sb-learn').className).toContain('overflow-hidden');
  });

  it('highlights the lede and omits demonstration controls', () => {
    renderExperience();
    const lede = screen.getByText('Press a button and see the action it triggers.');
    expect(lede.parentElement.className).toContain('bg-amber-50');
    expect(lede.parentElement.className).toContain('w-full');
    fireEvent.click(screen.getByRole('button', { name: /External Events & Sensors/i }));
    expect(screen.queryByRole('region', { name: 'Demonstration controls' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Replay' })).toBeNull();
    expect(screen.queryByRole('button', { name: /Sound/ })).toBeNull();
  });
});

describe('experience header', () => {
  it('links the marketing navigation to existing pages', () => {
    render(
      <MemoryRouter initialEntries={['/experience']}>
        <ExperienceHeader />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: 'Overview' }).getAttribute('href')).toBe('/');
    expect(screen.getByRole('link', { name: 'Product' }).getAttribute('href')).toBe('/product');
    expect(screen.getByRole('link', { name: 'Experience' }).getAttribute('href')).toBe('/experience');
    expect(screen.getByRole('link', { name: 'Reliability' }).getAttribute('href')).toBe('/reliability');
    expect(screen.getByRole('link', { name: 'Security' }).getAttribute('href')).toBe('/security');
    expect(screen.getByRole('link', { name: 'Downloads' }).getAttribute('href')).toBe('/downloads');
    expect(screen.getByRole('link', { name: 'Contact' }).getAttribute('href')).toBe('/contact');
  });
});
