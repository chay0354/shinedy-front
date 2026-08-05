import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../state/AppContext';
import { clearSession } from '../lib/auth';
import Flash from '../components/Flash';
import Button from '../components/Button';
import { RequireRole } from '../components/RequireRole';

export default function AdminLayout() {
  const { run } = useApp();
  const navigate = useNavigate();

  async function handleLogout() {
    clearSession();
    await run(() => api.logout());
    navigate('/login');
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
          <Flash />
          <Outlet />
        </div>
      </div>
    </RequireRole>
  );
}
