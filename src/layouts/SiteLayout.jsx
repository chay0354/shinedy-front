import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useApp } from '../state/AppContext';
import { getToken } from '../lib/auth';
import { hasActivePlan, isAdmin, isStaff } from '../lib/roles';
import { IconBag, IconUser } from '../components/icons';
import PointsBar from '../components/PointsBar';
import ScrollToTop from '../components/ScrollToTop';

const NAV = [
  { to: '/how', label: 'איך זה עובד' },
  { to: '/plans', label: 'מסלולי מנוי' },
  { to: '/catalog', label: 'קטלוג תכשיטים' },
  { to: '/faq', label: 'שאלות נפוצות' },
  { to: '/about', label: 'אודות' },
  { to: '/contact', label: 'יצירת קשר' },
];

export default function SiteLayout() {
  const { state } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const cartCount = state?.cart?.length || 0;
  const userName = state?.registration?.name;

  useEffect(() => {
    if (!getToken() || isAuthPage) return;
    if (isAdmin(state)) {
      navigate('/admin', { replace: true });
      return;
    }
    if (isStaff(state)) {
      navigate('/admin/warehouse', { replace: true });
    }
  }, [state, navigate, isAuthPage]);

  function accountPath() {
    if (!getToken()) return '/login';
    if (!hasActivePlan(state)) return '/account/plans';
    return '/account/me';
  }

  function boxPath() {
    if (!getToken()) return '/login';
    if (!hasActivePlan(state)) return '/account/plans';
    return '/box';
  }

  return (
    <>
      <ScrollToTop />
      <header className="site-header">
        <div className="header-top">
          <Link to="/" className="brand" aria-label="Shinedy — דף הבית">
            <img src="/brand/name-black.png" alt="SHINEDY" />
          </Link>
          <div className="header-icons">
            <Link
              to={accountPath()}
              className="icon-link"
              aria-label={getToken() ? 'האזור האישי שלי' : 'התחברות'}
              title={userName ? `שלום, ${userName}` : 'התחברות'}
            >
              <IconUser size={22} />
            </Link>
            <Link to={boxPath()} className="icon-link" aria-label="הקופסה שלי" title="הקופסה שלי">
              <IconBag size={22} />
              {cartCount > 0 && <span className="badge-count">{cartCount}</span>}
            </Link>
          </div>
        </div>
        <nav className="main-nav">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => (isActive ? 'active' : '')}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <PointsBar />
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container">
          <div>
            <img src="/brand/name-white.png" alt="SHINEDY" />
            <p style={{ fontSize: '0.93rem', maxWidth: 320, fontWeight: 300 }}>
              תכשיטים יוקרתיים במודל מנוי — בוחרות, עונדות, מחליפות.
              <br />
              NEW LOOK. SAME YOU.
            </p>
          </div>
          <div>
            <h4>ניווט</h4>
            {NAV.slice(0, 4).map((n) => (
              <Link key={n.to} to={n.to}>
                {n.label}
              </Link>
            ))}
          </div>
          <div>
            <h4>חשבון</h4>
            <Link to="/signup">הרשמה</Link>
            <Link to="/login">התחברות</Link>
            <Link to={accountPath()}>אזור אישי</Link>
          </div>
          <div>
            <h4>משפטי</h4>
            <Link to="/terms">תקנון והסכם מנוי</Link>
            <Link to="/privacy">מדיניות פרטיות</Link>
            <Link to="/faq">שאלות נפוצות</Link>
          </div>
        </div>
        <div className="fine">© Shinedy 2026 · כל הזכויות שמורות</div>
      </footer>
    </>
  );
}
