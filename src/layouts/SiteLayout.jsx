import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useApp } from '../state/AppContext';
import { getToken } from '../lib/auth';
import { SERVICE_EMAIL, SERVICE_PHONE, SERVICE_PHONE_TEL, INSTAGRAM_URL, FACEBOOK_URL } from '../lib/contact';
import { useFavorites } from '../lib/favorites';
import { hasActivePlan, isAdmin, isStaff } from '../lib/roles';
import { IconBag, IconClose, IconFacebook, IconHeart, IconInstagram, IconMenu, IconSearch, IconUser } from '../components/icons';
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
  const isAuthPage =
    location.pathname === '/login' ||
    location.pathname === '/signup' ||
    location.pathname === '/verify-email' ||
    location.pathname === '/verify-phone';
  const loggedIn = Boolean(getToken() && state?.auth);
  const cartCount = state?.cart?.length || 0;
  const userName = state?.registration?.name;
  const { count: favCount } = useFavorites();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (!getToken() || !state?.auth) return;
    if (isAdmin(state)) {
      if (!location.pathname.startsWith('/admin')) navigate('/admin', { replace: true });
      return;
    }
    if (isStaff(state)) {
      if (!location.pathname.startsWith('/admin')) navigate('/admin/warehouse', { replace: true });
      return;
    }
    if (isAuthPage) return;
  }, [state, navigate, isAuthPage, location.pathname]);

  useEffect(() => {
    setNavOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  function accountPath() {
    if (!getToken() || !state?.auth) return '/login';
    if (isAdmin(state)) return '/admin';
    if (isStaff(state)) return '/admin/warehouse';
    return '/account/me';
  }

  function boxPath() {
    if (!getToken() || !state?.auth) return '/login';
    if (isAdmin(state) || isStaff(state)) return accountPath();
    if (!hasActivePlan(state)) return '/account/plans';
    return '/box';
  }

  return (
    <>
      <ScrollToTop />
      <header className={`site-header${isAuthPage ? ' is-auth' : ''}${navOpen ? ' nav-open' : ''}`}>
        {!isAuthPage && (
          <div className="site-topline">מנוי חודשי · החלפה חופשית · משלוח עד הבית</div>
        )}
        <div className={`header-top${searchOpen ? ' search-open' : ''}`}>
          <button
            type="button"
            className="nav-toggle"
            aria-label={navOpen ? 'סגירת תפריט' : 'פתיחת תפריט'}
            aria-expanded={navOpen}
            onClick={() => setNavOpen((v) => !v)}
          >
            {navOpen ? <IconClose size={22} /> : <IconMenu size={22} />}
          </button>
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
                className="icon-link desktop-only-icon"
                aria-label="חיפוש"
                title="חיפוש"
                onClick={() => setSearchOpen(true)}
              >
                <IconSearch size={22} />
              </button>
            )}
            <Link to="/favorites" className="icon-link desktop-only-icon" aria-label="מועדפים" title="מועדפים">
              <IconHeart size={22} filled={favCount > 0} />
              {favCount > 0 && <span className="badge-count">{favCount}</span>}
            </Link>
            <Link
              to={accountPath()}
              className="icon-link desktop-only-icon"
              aria-label={loggedIn ? 'אזור אישי' : 'התחברות'}
              title={loggedIn ? 'אזור אישי' : 'התחברות'}
            >
              <IconUser size={22} />
            </Link>
            <Link to={boxPath()} className="icon-link icon-bag" aria-label="הקופסה שלי" title="הקופסה שלי">
              <IconBag size={22} />
              {cartCount > 0 && <span className="badge-count">{cartCount}</span>}
            </Link>
          </div>
        </div>
        <nav className={`main-nav${navOpen ? ' is-open' : ''}`}>
          {NAV.filter((n) => !(loggedIn && n.to === '/plans')).map((n) => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => (isActive ? 'active' : '')}>
              {n.label}
            </NavLink>
          ))}
          <div className="nav-extra">
            <form
              className="header-search nav-search"
              onSubmit={(e) => {
                e.preventDefault();
                const q = searchQ.trim();
                setNavOpen(false);
                navigate(q ? `/catalog?q=${encodeURIComponent(q)}` : '/catalog');
              }}
            >
              <input
                type="search"
                placeholder="חיפוש תכשיט..."
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                aria-label="חיפוש בקטלוג"
              />
            </form>
            <NavLink to="/favorites">מועדפים{favCount > 0 ? ` (${favCount})` : ''}</NavLink>
            <NavLink to={accountPath()}>{loggedIn ? (userName ? `שלום, ${userName}` : 'אזור אישי') : 'התחברות'}</NavLink>
            {!loggedIn && <NavLink to="/signup">הרשמה</NavLink>}
          </div>
        </nav>
        <PointsBar />
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-brand">
            <img src="/brand/name-white.png" alt="SHINEDY" />
            <p>
              תכשיטים יוקרתיים במודל מנוי — בוחרות, עונדות, מחליפות.
              <br />
              NEW LOOK. SAME YOU.
            </p>
          </div>
          <details className="footer-group">
            <summary>עלינו</summary>
            <div className="footer-links">
              <Link to="/how">איך זה עובד</Link>
              {!loggedIn && <Link to="/plans">מסלולי מנוי</Link>}
              <Link to="/catalog">תכשיטים</Link>
              <Link to="/about">אודות</Link>
            </div>
          </details>
          <details className="footer-group">
            <summary>חשבון</summary>
            <div className="footer-links">
              {loggedIn ? (
                <>
                  <Link to={accountPath()}>אזור אישי</Link>
                  <Link to={boxPath()}>הקופסה שלי</Link>
                </>
              ) : (
                <>
                  <Link to="/signup">הרשמה</Link>
                  <Link to="/login">התחברות</Link>
                </>
              )}
            </div>
          </details>
          <details className="footer-group">
            <summary>משפטי</summary>
            <div className="footer-links">
              <Link to="/terms">תקנון והסכם מנוי</Link>
              <Link to="/privacy">מדיניות פרטיות</Link>
            </div>
          </details>
          <details className="footer-group">
            <summary>צריכים עזרה</summary>
            <div className="footer-links">
              <Link to="/contact">צור קשר</Link>
              <Link to="/faq">שאלות נפוצות</Link>
              <a href={`tel:${SERVICE_PHONE_TEL}`} dir="ltr">{SERVICE_PHONE}</a>
              <a href={`mailto:${SERVICE_EMAIL}`} dir="ltr">{SERVICE_EMAIL}</a>
            </div>
          </details>
          <div className="footer-socials">
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" aria-label="Instagram">
              <IconInstagram size={22} />
            </a>
            <a href={FACEBOOK_URL} target="_blank" rel="noreferrer" aria-label="Facebook">
              <IconFacebook size={22} />
            </a>
          </div>
        </div>
        <div className="fine">© Shinedy 2026 · כל הזכויות שמורות</div>
      </footer>
    </>
  );
}
