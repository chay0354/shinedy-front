import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';import { api } from '../api';
import { useApp } from '../state/AppContext';
import { clearSession } from '../lib/auth';
import { RequireRole } from '../components/RequireRole';
import AdminNav, { navItemsForStaff } from '../components/AdminNav';
import { currentStaff, staffCanAccess, staffHome } from '../lib/staff';
import { loadAdminMeta } from '../lib/dbFromState';

export default function AdminLayout() {
  const { state, run, refresh } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const meta = loadAdminMeta();
  const me = currentStaff(state, meta.staff);
  const isManager = me?.role === 'מנהלת';
  const visibleTabs = navItemsForStaff(me, isManager, staffCanAccess);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

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
            <button
              type="button"
              className="admin-menu-btn"
              aria-label={menuOpen ? 'סגירת תפריט' : 'פתיחת תפריט'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? '✕' : '☰'}
            </button>
            <img src="/brand/name-white.png" alt="SHINEDY" />
            <span className="admin-title">ניהול</span>
            <span style={{ flex: 1 }} />
            {me && <span className="admin-bar-user">{me.name} · {me.role}</span>}
            {isManager && (
              <Link to="/admin/settings" className="admin-bar-link" title="הגדרות">
                ⚙ הגדרות
              </Link>
            )}
            <Link to="/" className="admin-bar-link" target="_blank" rel="noreferrer">
              לאתר ↗
            </Link>
            <button type="button" className="admin-bar-link link-btn-plain" onClick={handleLogout}>
              יציאה
            </button>
          </div>
        </div>
        <AdminNav items={visibleTabs} mobileOpen={menuOpen} onClose={() => setMenuOpen(false)} />
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </RequireRole>
  );
}
