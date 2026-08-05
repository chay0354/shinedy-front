import { Navigate } from 'react-router-dom';
import { getToken } from '../lib/auth';
import { useApp } from '../state/AppContext';
import { homePathForRole } from '../lib/roles';

export function RequireRole({ role, roles, children }) {
  const { state, loading } = useApp();
  const allowed = roles || (role ? [role] : []);

  if (loading) {
    return (
      <div className="app-shell">
        <div className="loading">טוען…</div>
      </div>
    );
  }

  if (!getToken()) {
    return <Navigate to="/login" replace />;
  }

  const userRole = state?.auth?.role;
  if (!userRole || !allowed.includes(userRole)) {
    if (!userRole) {
      return <Navigate to="/login" replace />;
    }
    return <Navigate to={homePathForRole(userRole)} replace />;
  }

  return children;
}

export function BlockStaffFromCustomer({ children }) {
  const { state, loading } = useApp();

  if (loading) {
    return (
      <div className="app-shell">
        <div className="loading">טוען…</div>
      </div>
    );
  }

  if (
    getToken() &&
    (state?.auth?.role === 'admin' || state?.auth?.role === 'warehouse')
  ) {
    return <Navigate to={homePathForRole(state.auth.role)} replace />;
  }

  return children;
}
