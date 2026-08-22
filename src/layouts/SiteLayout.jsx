import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useApp } from '../state/AppContext';
import { getToken } from '../lib/auth';
import { SERVICE_EMAIL, SERVICE_PHONE, SERVICE_PHONE_TEL } from '../lib/contact';
import { useFavorites } from '../lib/favorites';
import { hasActivePlan, isAdmin, isStaff } from '../lib/roles';
import { IconBag, IconHeart, IconSearch, IconUser } from '../components/icons';
import PointsBar from '../components/PointsBar';
import ScrollToTop from '../components/ScrollToTop';

const NAV = [
  { to: '/how', label: 'איך זה עובד' },
  { to: '/plans', label: 'מסלולי מנוי' },
  { to: '/catalog', label: 'תכשיטים' },
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
  const { count: favCount } = useFavorites();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');

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
            {searchOpen ? (
              <form
                className="header-search"
                onSubmit={(e) => {
                  e.preventDefault();
                  const q = searchQ.trim();
                  setSearchOpen(false);
                  navigate(q ? `/catalog?q=${encodeURIComponent(q)}` : '/catalog');
                }}
              >
                <input
                  autoFocus
                  type="search"
                  placeholder="חיפוש תכשיט..."
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  onBlur={() => {
                    if (!searchQ.trim()) setSearchOpen(false);
                  }}
                  aria-label="חיפוש בקטלוג"
                />
              </form>
            ) : (
              <button
                type="button"
                className="icon-link"
                aria-label="חיפוש"
                title="חיפוש"
                onClick={() => setSearchOpen(true)}
              >
                <IconSearch size={22} />
              </button>
            )}
            <Link to="/favorites" className="icon-link" aria-label="מועדפים" title="מועדפים">
              <IconHeart size={22} filled={favCount > 0} />
              {favCount > 0 && <span className="badge-count">{favCount}</span>}
            </Link>
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
            <a href={`tel:${SERVICE_PHONE_TEL}`} dir="ltr">{SERVICE_PHONE}</a>
            <a href={`mailto:${SERVICE_EMAIL}`} dir="ltr">{SERVICE_EMAIL}</a>
          </div>
        </div>
        <div className="fine">© Shinedy 2026 · כל הזכויות שמורות</div>
      </footer>
    </>
  );
}
