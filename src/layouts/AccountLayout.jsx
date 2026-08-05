import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../state/AppContext';
import { clearSession } from '../lib/auth';
import Flash from '../components/Flash';
import Button from '../components/Button';

const PERSONAL_PATHS = ['/account/me', '/account/dashboard', '/account/exchange', '/account/returns', '/account/history'];

export default function AccountLayout() {
  const { state, run } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const cartCount = state?.cart?.length || 0;

  const isShopNav =
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
    clearSession();
    await run(() => api.logout());
    navigate('/login');
  }

  return (
    <div className="layout-split">
      <aside className="sidebar sidebar-account">
        <div className="sidebar-top">
          <div className="brand" style={{ padding: '0 24px 20px', fontSize: 20 }}>
            SHINEDY
          </div>
          <NavLink to="/account/shop" className={() => (isShopNav ? 'active' : '')}>
            עמוד הבית
            {cartCount > 0 ? ` · סל (${cartCount})` : ''}
          </NavLink>
          <NavLink to="/account/me" className={() => (isPersonal ? 'active' : '')}>
            אזור אישי
          </NavLink>
          {state?.subscribed ? (
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
        {!state?.subscribed ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div className="display" style={{ fontSize: 26, marginBottom: 12 }}>
              עדיין לא הצטרפת למסלול
            </div>
            <p className="muted" style={{ marginBottom: 24, maxWidth: 360, marginInline: 'auto' }}>
              כדי להזמין תכשיטים מאזור האישי יש לבחור מסלול. אפשר גם לדפדף בחנות הציבורית.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <NavLink to="/plans" className="btn btn-primary">
                לבחירת מסלול
              </NavLink>
              <NavLink to="/" className="btn">
                לחנות
              </NavLink>
            </div>
          </div>
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  );
}
