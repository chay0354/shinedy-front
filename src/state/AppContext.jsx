import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../api';
import { applySessionFromResponse } from '../lib/auth';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const data = await api.getState();
      setState(data);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const run = useCallback(async (fn) => {
    try {
      const data = await fn();
      applySessionFromResponse(data);
      setState(data.session ? { ...data, session: undefined } : data);
      setError(null);
      return data;
    } catch (e) {
      setError(e.message);
      try {
        const fresh = await api.getState();
        setState(fresh);
      } catch {
        /* keep last known state if refresh fails */
      }
      throw e;
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <AppContext.Provider value={{ state, loading, error, setError, refresh, run }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
