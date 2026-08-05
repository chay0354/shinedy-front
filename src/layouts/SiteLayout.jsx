import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../state/AppContext';
import Button from '../components/Button';

export default function SiteLayout() {
  const { state } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <>
      <header className={`site-header${isHome ? ' site-header-home' : ''}`}>
        <div className="brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          SHINEDY
        </div>
        <nav className="nav-links">
          <NavLink to="/" end>
            בית
          </NavLink>
          <NavLink to="/how">איך זה עובד</NavLink>
          <NavLink to="/plans">מסלולים</NavLink>
          <NavLink to="/catalog">קטלוג</NavLink>
          <NavLink to="/info">מידע</NavLink>
        </nav>
        {state?.subscribed ? (
          <Button type="button" className="btn btn-primary" onClick={() => navigate('/account/me')}>
            האזור שלי
          </Button>
        ) : (
          <Button type="button" className="btn btn-primary" onClick={() => navigate('/login')}>
            התחברות / הרשמה
          </Button>
        )}
      </header>
      <Outlet />
      <footer className="footer">
        <div>© 2026 Shinedy</div>
        <div style={{ display: 'flex', gap: 20 }}>
          <NavLink to="/info">שאלות נפוצות</NavLink>
          <NavLink to="/info">אודות</NavLink>
          <NavLink to="/info">צור קשר</NavLink>
        </div>
      </footer>
    </>
  );
}
