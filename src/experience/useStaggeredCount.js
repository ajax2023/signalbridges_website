import { useEffect, useState } from 'react';

function motionReduced() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Reveals 1..total items on a short interval. `delayMs` holds the first item. */
export function useStaggeredCount(key, total, { intervalMs = 150, delayMs = 0, immediate = false } = {}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!key || total < 1) {
      setCount(0);
      return undefined;
    }
    if (immediate || motionReduced()) {
      setCount(total);
      return undefined;
    }

    const timers = [];
    for (let next = 1; next <= total; next += 1) {
      const at = delayMs + (next - 1) * intervalMs;
      if (at === 0) setCount(next);
      else timers.push(window.setTimeout(() => setCount(next), at));
    }
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [key, total, intervalMs, delayMs, immediate]);

  return count;
}
