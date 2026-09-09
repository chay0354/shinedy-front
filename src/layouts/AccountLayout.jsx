import { Outlet } from 'react-router-dom';
import { getToken } from '../lib/auth';
import { useApp } from '../state/AppContext';
import Flash from '../components/Flash';

export default function AccountLayout() {
  const { state } = useApp();
  const token = getToken();
  const sessionReady = !token || Boolean(state?.auth?.userId);
  return (
    <>
      <Flash />
      {!sessionReady ? (
        <div className="loading">טוען…</div>
      ) : (
        <Outlet />
      )}
    </>
  );
}
