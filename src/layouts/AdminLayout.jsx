import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../state/AppContext';
import { clearSession } from '../lib/auth';
import { RequireRole } from '../components/RequireRole';

const TABS = [
  { to: '/admin', label: 'לוח בקרה', end: true },
  { to: '/admin/warehouse', label: 'הזמנות מחסן' },
  { to: '/admin/rentals', label: 'ניהול השכרות' },
  { to: '/admin/inventory', label: 'ניהול מלאי' },
  { to: '/admin/customers', label: 'ניהול לקוחות' },
  { to: '/admin/subscriptions', label: 'מנויים' },
  { to: '/admin/expenses', label: 'הוצאות ותעריפים' },
  { to: '/admin/reports', label: 'דוחות' },
];

export default function AdminLayout() {
  const { run, refresh } = useApp();
  const navigate = useNavigate();

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
            <Link to="/" className="admin-bar-link">
              לאתר ↗
            </Link>
            <button type="button" className="admin-bar-link link-btn-plain" onClick={handleLogout}>
              יציאה
            </button>
          </div>
        </div>
        <nav className="admin-tabs">
          {TABS.map((t) => (
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
