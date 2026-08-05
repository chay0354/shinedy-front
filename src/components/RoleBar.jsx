import { NavLink } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../state/AppContext';
import { clearSession } from '../lib/auth';

const SHOW_STAFF = import.meta.env.VITE_ENABLE_STAFF === 'true';

export default function RoleBar() {
  const { run } = useApp();

  async function handleLogout() {
    clearSession();
    await run(() => api.logout());
  }

  return (
    <div className="role-bar">
      <span>Shinedy</span>
      <div className="roles">
        <NavLink to="/" className="btn btn-sm" end>
          אתר
        </NavLink>
        <NavLink to="/account" className="btn btn-sm">
          אזור אישי
        </NavLink>
        {SHOW_STAFF && (
          <>
            <NavLink to="/admin" className="btn btn-sm">
              ניהול
            </NavLink>
            <NavLink to="/warehouse" className="btn btn-sm">
              מחסן
            </NavLink>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => run(() => api.reset())}
              title="איפוס נתוני הדמו"
            >
              איפוס
            </button>
          </>
        )}
      </div>
    </div>
  );
}
