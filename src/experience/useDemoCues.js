import { useEffect, useRef } from 'react';

function playCue(type) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  let ctx;
  try {
    ctx = new AudioCtx();
  } catch {
    return;
  }
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.035, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);
  osc.type = type === 'strobe' ? 'square' : type === 'paging' ? 'triangle' : 'sine';
  const freq = type === 'phone' ? 480 : type === 'strobe' ? 160 : type === 'paging' ? 660 : 840;
  osc.frequency.setValueAtTime(freq, now);
  if (type === 'phone') osc.frequency.setValueAtTime(620, now + 0.12);
  osc.start(now);
  osc.stop(now + 0.28);
  osc.onended = () => {
    ctx.close().catch(() => {});
  };
}

export function useDemoCues(enabled, event, timeline) {
  const prevRef = useRef([]);

  useEffect(() => {
    const active = timeline?.activeActionIds || [];
    if (!enabled || !event) {
      prevRef.current = active;
      return;
    }
    const started = active.filter((id) => !prevRef.current.includes(id));
    started.forEach((id) => {
      const action = event.actions.find((item) => item.id === id);
      if (action) playCue(action.type);
    });
    prevRef.current = active;
  }, [enabled, event, timeline]);
}
