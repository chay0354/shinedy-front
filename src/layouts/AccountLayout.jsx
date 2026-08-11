import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getToken } from '../lib/auth';
import { hasActivePlan } from '../lib/roles';
import { useApp } from '../state/AppContext';
import Flash from '../components/Flash';

export default function AccountLayout() {
  const { state } = useApp();
  const location = useLocation();
  const token = getToken();
  const sessionReady = !token || Boolean(state?.auth?.userId);
  const subscribed = hasActivePlan(state);
  const isPlansRoute = location.pathname === '/account/plans';

  return (
    <>
      <Flash />
      {!sessionReady ? (
        <div className="loading">טוען…</div>
      ) : !subscribed && !isPlansRoute ? (
        <Navigate to="/account/plans" replace />
      ) : subscribed && isPlansRoute ? (
        <Navigate to="/account/me" replace />
      ) : (
        <Outlet />
      )}
    </>
  );
}
