import { useEffect, useState } from 'react';

const KEY = 'shinedy-favorites';
const listeners = new Set();

function readIds() {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function writeIds(ids) {
  localStorage.setItem(KEY, JSON.stringify(ids));
  listeners.forEach((fn) => fn(ids));
}

export function toggleFavorite(id) {
  if (!id) return readIds();
  const cur = readIds();
  const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
  writeIds(next);
  return next;
}

export function useFavorites() {
  const [ids, setIds] = useState(readIds);

  useEffect(() => {
    const onChange = (next) => setIds(next);
    listeners.add(onChange);
    const onStorage = (e) => {
      if (e.key === KEY) setIds(readIds());
    };
    window.addEventListener('storage', onStorage);
    return () => {
      listeners.delete(onChange);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return {
    ids,
    count: ids.length,
    has: (id) => ids.includes(id),
    toggle: (id) => toggleFavorite(id),
  };
}
