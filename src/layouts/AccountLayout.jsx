import { NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../state/AppContext';
import { clearSession, getToken } from '../lib/auth';
import { hasActivePlan } from '../lib/roles';
import Flash from '../components/Flash';
import Button from '../components/Button';

const PERSONAL_PATHS = ['/account/me', '/account/dashboard', '/account/exchange', '/account/returns', '/account/history'];

export default function AccountLayout() {
  const { state, run, refresh } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const cartCount = state?.cart?.length || 0;

  const isPlansRoute = location.pathname === '/account/plans';
  const token = getToken();
  // After login, React may navigate before context state catches up — wait for hydration.
  const sessionReady = !token || Boolean(state?.auth?.userId);
  const subscribed = hasActivePlan(state);
  const needsPlan = sessionReady && !subscribed;

  const isShopNav =
    isPlansRoute ||
    location.pathname.startsWith('/account/shop') ||
    location.pathname.startsWith('/account/catalog') ||
    location.pathname.startsWith('/account/cart') ||
    location.pathname === '/account';

  const isStoreHome =
    location.pathname.startsWith('/account/shop') ||
    location.pathname.startsWith('/account/catalog') ||
    location.pathname === '/account';

  const isPersonal = PERSONAL_PATHS.some(
    (p) => location.pathname === p || location.pathname.startsWith(`${p}/`),
  );

  async function handleLogout() {
    try {
      await run(() => api.logout());
    } catch {
      /* ignore */
    } finally {
      clearSession();
      await refresh();
      navigate('/login', { replace: true });
    }
  }

  return (
    <div className="layout-split">
      <aside className="sidebar sidebar-account">
        <div className="sidebar-top">
          <div className="brand" style={{ padding: '0 24px 20px', fontSize: 20 }}>
            SHINEDY
          </div>
          <NavLink
            to={needsPlan ? '/account/plans' : '/account/shop'}
            className={() => (isShopNav ? 'active' : '')}
          >
            עמוד הבית
            {cartCount > 0 ? ` · סל (${cartCount})` : ''}
          </NavLink>
          <NavLink to="/account/me" className={() => (isPersonal ? 'active' : '')}>
            אזור אישי
          </NavLink>
          {subscribed ? (
            <div className="sidebar-points">
              <div className="sidebar-points-label">נקודות זמינות</div>
              <div className="sidebar-points-value">
                {state.remaining ?? 0}
                <span>/ {state.pointsTotal ?? 0}</span>
              </div>
              {state.pointsTotal > 0 ? (
                <div className="sidebar-points-bar">
                  <div
                    style={{
                      width: `${Math.round(
                        ((state.remaining ?? 0) / state.pointsTotal) * 100,
                      )}%`,
                    }}
                  />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className="sidebar-footer">
          <Button type="button" className="sidebar-logout" onClick={handleLogout}>
            התנתקות
          </Button>
        </div>
      </aside>
      <div className={`main-pane${isStoreHome ? ' main-pane-store' : ''}`}>
        <Flash />
        {!sessionReady ? (
          <div className="loading">טוען…</div>
        ) : needsPlan && !isPlansRoute ? (
          <Navigate to="/account/plans" replace />
        ) : subscribed && isPlansRoute ? (
          <Navigate to="/account/shop" replace />
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  );
}
