import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { getToken } from './auth.js';

const KEY = 'shinedy-favorites';
const listeners = new Set();
let syncedToken = null;

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

export function clearLocalFavorites() {
  syncedToken = null;
  localStorage.removeItem(KEY);
  listeners.forEach((fn) => fn([]));
}

// Logged-in customers keep favorites on the server so staff can see demand per model.
export async function syncWithServer() {
  const token = getToken();
  if (!token || syncedToken === token) return;
  syncedToken = token;
  try {
    const local = readIds();
    const data = local.length ? await api.mergeFavorites(local) : await api.getFavorites();
    if (Array.isArray(data?.ids)) writeIds(data.ids);
  } catch {
    syncedToken = null;
  }
}

export function toggleFavorite(id) {
  if (!id) return readIds();
  const cur = readIds();
  const on = !cur.includes(id);
  const next = on ? [...cur, id] : cur.filter((x) => x !== id);
  writeIds(next);
  if (getToken()) {
    api
      .setFavorite(id, on)
      .then((data) => {
        if (Array.isArray(data?.ids)) writeIds(data.ids);
      })
      .catch(() => {});
  }
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
    syncWithServer();
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
