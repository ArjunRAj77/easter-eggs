import { useState, useEffect, useCallback } from 'react';

/**
 * THE COLLECTION
 *
 * Opening an egg cracks it and adds it to your jar. That's the whole loop —
 * and it's enough, because the reward is the same one that makes achievement
 * lists work: a number that only goes up, and a visible gap you want to close.
 *
 * Two design decisions worth stating:
 *
 * 1. **Collecting is a side effect of looking, not a separate button.** A
 *    "collect" button would make the loop a chore. Opening an egg is already
 *    the thing we want people to do; the counter just notices.
 *
 * 2. **Stored by egg id, never by index.** The catalogue is community-edited
 *    — reordering `eggs.json` must not silently rewrite someone's progress.
 *
 * State is broadcast through a window event as well as React state, so the
 * header counter, the cards and the mascot all stay in sync without threading
 * a context through every component.
 */

const KEY = 'easter-eggs:collected:v1';
const EVENT = 'eggs:collection-changed';

const read = (): Set<string> => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed.filter((x): x is string => typeof x === 'string')) : new Set();
  } catch {
    // Private mode, disabled storage, or corrupt JSON. An unreadable jar is
    // an empty jar — never a crash.
    return new Set();
  }
};

const write = (set: Set<string>) => {
  try {
    localStorage.setItem(KEY, JSON.stringify([...set]));
  } catch { /* storage full or blocked — the session still works in memory */ }
  window.dispatchEvent(new CustomEvent(EVENT));
};

export const useCollection = (total: number) => {
  const [collected, setCollected] = useState<Set<string>>(() => new Set());
  const [justCracked, setJustCracked] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  // Hydrate after mount rather than in the initialiser: reading localStorage
  // during the first render diverges from the initial markup and, more
  // practically, throws in any environment without a DOM.
  useEffect(() => {
    setCollected(read());
    const sync = () => setCollected(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const collect = useCallback(
    (id: string) => {
      setCollected((prev) => {
        if (prev.has(id)) return prev;
        const next = new Set(prev);
        next.add(id);
        write(next);
        setJustCracked(id);
        window.setTimeout(() => setJustCracked((c) => (c === id ? null : c)), 900);
        if (next.size === total) {
          setCompleted(true);
          window.setTimeout(() => setCompleted(false), 9000);
        }
        return next;
      });
    },
    [total],
  );

  const reset = useCallback(() => {
    const empty = new Set<string>();
    setCollected(empty);
    write(empty);
  }, []);

  return {
    collected,
    count: collected.size,
    total,
    pct: total === 0 ? 0 : collected.size / total,
    has: useCallback((id: string) => collected.has(id), [collected]),
    justCracked,
    completed,
    collect,
    reset,
  };
};

export type Collection = ReturnType<typeof useCollection>;
