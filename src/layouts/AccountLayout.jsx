import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { clearSession, getToken } from '../lib/auth';
import { useApp } from '../state/AppContext';
import Flash from '../components/Flash';

export default function AccountLayout() {
  const { state, loading } = useApp();
  const token = getToken();
  const signedOut = Boolean(state) && !loading && Boolean(token) && !state.auth?.userId;

  useEffect(() => {
    if (signedOut) clearSession();
  }, [signedOut]);

  if (!state && loading) return <div className="loading">טוען…</div>;
  if (signedOut) return <Navigate to="/signup" replace />;
  if (token && !state?.auth?.userId) return <div className="loading">טוען…</div>;

  return (
    <>
      <Flash />
      <Outlet />
    </>
  );
}
