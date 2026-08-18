import { Link, NavLink, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../state/AppContext';
import { clearSession } from '../lib/auth';
import { RequireRole } from '../components/RequireRole';
import { ADMIN_TABS, currentStaff, staffCanAccess, staffHome } from '../lib/staff';
import { loadAdminMeta } from '../lib/dbFromState';

const TABS = ADMIN_TABS.map((t) => ({
  to: t.path,
  label: t.label,
  end: t.path === '/admin',
}));

export default function AdminLayout() {
  const { state, run, refresh } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const meta = loadAdminMeta();
  const me = currentStaff(state, meta.staff);
  const isManager = me?.role === 'מנהלת';
  const visibleTabs = TABS.filter((t) => !me || isManager || staffCanAccess(me, t.to));

  if (me && !isManager && !staffCanAccess(me, location.pathname)) {
    return <Navigate to={staffHome(me)} replace />;
  }

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
    <RequireRole roles={['admin', 'warehouse']}>
      <div className="admin-app">
        <div className="admin-bar">
          <div className="admin-bar-inner">
            <img src="/brand/name-white.png" alt="SHINEDY" />
            <span className="admin-title">מערכת ניהול</span>
            <span style={{ flex: 1 }} />
            {me && <span className="admin-bar-user">{me.name} · {me.role}</span>}
            {isManager && (
              <Link to="/admin/settings" className="admin-bar-link" title="הגדרות">
                ⚙ הגדרות
              </Link>
            )}
            <Link to="/" className="admin-bar-link">
              לאתר ↗
            </Link>
            <button type="button" className="admin-bar-link link-btn-plain" onClick={handleLogout}>
              יציאה
            </button>
          </div>
        </div>
        <nav className="admin-tabs">
          {visibleTabs.map((t) => (
            <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => (isActive ? 'on' : '')}>
              {t.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </RequireRole>
  );
}
