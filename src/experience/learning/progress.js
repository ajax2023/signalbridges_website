import { useCallback, useState } from 'react';

export const PROGRESS_STORAGE_KEY = 'sb-learning-progress-v1';

export function emptyProgress() {
  return { modules: {} };
}

export function loadProgress() {
  try {
    if (typeof localStorage === 'undefined' || typeof localStorage.getItem !== 'function') {
      return emptyProgress();
    }
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.modules !== 'object' || parsed.modules == null) {
      return emptyProgress();
    }
    return { modules: parsed.modules };
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(progress) {
  try {
    if (typeof localStorage === 'undefined' || typeof localStorage.setItem !== 'function') return;
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Storage can be blocked in private browsing. The demo still runs.
  }
}

export function addCompletion(progress, moduleId, eventId) {
  if (!moduleId || !eventId) return progress;
  const current = progress.modules?.[moduleId]?.events || [];
  if (current.includes(eventId)) return progress;
  return {
    modules: {
      ...progress.modules,
      [moduleId]: { events: [...current, eventId] },
    },
  };
}

export function clearModuleCompletions(progress, moduleId) {
  if (!moduleId || !progress.modules?.[moduleId]) return progress;
  const modules = { ...progress.modules };
  delete modules[moduleId];
  return { modules };
}

export function isModuleComplete(progress, moduleId) {
  return (progress.modules?.[moduleId]?.events || []).length > 0;
}

export function completedCount(progress, moduleIds) {
  return moduleIds.filter((id) => isModuleComplete(progress, id)).length;
}

export function useLearningProgress() {
  const [progress, setProgress] = useState(loadProgress);

  const recordCompletion = useCallback((moduleId, eventId) => {
    setProgress((prev) => {
      const next = addCompletion(prev, moduleId, eventId);
      if (next === prev) return prev;
      saveProgress(next);
      return next;
    });
  }, []);

  const clearModule = useCallback((moduleId) => {
    setProgress((prev) => {
      const next = clearModuleCompletions(prev, moduleId);
      if (next === prev) return prev;
      saveProgress(next);
      return next;
    });
  }, []);

  return { progress, recordCompletion, clearModule };
}
