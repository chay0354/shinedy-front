import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../state/AppContext';
import { clearSession } from '../lib/auth';
import Button from '../components/Button';
import { RequireRole } from '../components/RequireRole';

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
    <RequireRole role="admin">
      <div className="layout-split">
        <aside className="sidebar sidebar-account">
          <div className="sidebar-top">
            <div className="brand" style={{ padding: '0 24px 20px', fontSize: 20 }}>
              SHINEDY
            </div>
            <div className="muted" style={{ padding: '0 24px 12px', fontSize: 12 }}>
              ניהול מערכת
            </div>
            <NavLink to="/admin/products">מוצרים בחנות</NavLink>
            <NavLink to="/admin/inventory">ניהול מלאי</NavLink>
          </div>
          <div className="sidebar-footer">
            <Button type="button" className="sidebar-logout" onClick={handleLogout}>
              התנתקות
            </Button>
          </div>
        </aside>
        <div className="main-pane">
          <Outlet />
        </div>
      </div>
    </RequireRole>
  );
}
