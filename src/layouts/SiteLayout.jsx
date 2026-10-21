import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useApp } from '../state/AppContext';
import { getToken } from '../lib/auth';
import { SERVICE_EMAIL, SERVICE_HOURS, SERVICE_PHONE, SERVICE_PHONE_TEL, INSTAGRAM_URL, FACEBOOK_URL } from '../lib/contact';
import { clearLocalFavorites, syncWithServer, useFavorites } from '../lib/favorites';
import { hasActivePlan, isAdmin, isStaff } from '../lib/roles';
import { IconBag, IconClose, IconFacebook, IconHeart, IconInstagram, IconMenu, IconSearch, IconUser, IconUserPlus } from '../components/icons';
import PointsBar from '../components/PointsBar';
import ScrollToTop from '../components/ScrollToTop';
import CookieBanner from '../components/CookieBanner';
import ScrollReveal from '../components/ScrollReveal';
import PalettePicker from '../components/PalettePicker';

const NAV = [
  { to: '/how', label: 'איך זה עובד' },
  { to: '/plans', label: 'מסלולי מנוי' },
  { to: '/catalog', label: 'תכשיטים' },
  { to: '/about', label: 'אודות' },
  { to: '/contact', label: 'יצירת קשר' },
];

const FOOTER_WIDE = '(min-width: 721px)';

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
  const inCustomerArea =
    loggedIn &&
    !isStaff(state) &&
    !isAdmin(state) &&
    (location.pathname.startsWith('/account') ||
      location.pathname === '/box' ||
      location.pathname === '/exchange');
  const cartCount = state?.cart?.length || 0;
  const { count: favCount } = useFavorites();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [navOpen, setNavOpen] = useState(false);
  const [footerWide, setFooterWide] = useState(() => window.matchMedia(FOOTER_WIDE).matches);
  const favUserRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia(FOOTER_WIDE);
    const sync = () => setFooterWide(mq.matches);
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const userId = getToken() ? state?.auth?.userId || null : null;
    if (userId && !isStaff(state)) syncWithServer();
    if (!userId && favUserRef.current) clearLocalFavorites();
    favUserRef.current = userId;
  }, [state?.auth?.userId]);

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

  useEffect(() => {
    const q = new URLSearchParams(location.search).get('q');
    if (q) setSearchQ(q);
  }, [location.search]);

  function submitSearch(e) {
    e.preventDefault();
    const q = searchQ.trim();
    setSearchOpen(false);
    setNavOpen(false);
    navigate(q ? `/catalog?q=${encodeURIComponent(q)}` : '/catalog');
  }

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
      <ScrollReveal />
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
          <Link to="/" className="brand" aria-label="Shinedy, דף הבית">
            <img src="/brand/name-black.png" alt="SHINEDY" />
          </Link>
          <div className="header-icons">
            <button
              type="button"
              className="icon-link search-trigger"
              aria-label="חיפוש"
              aria-expanded={searchOpen}
              title="חיפוש"
              onClick={() => setSearchOpen((v) => !v)}
            >
              <IconSearch size={22} />
            </button>
            {searchOpen && (
              <form className="header-search" onSubmit={submitSearch}>
                <input
                  autoFocus
                  type="search"
                  placeholder="חיפוש לפי שם או מק״ט..."
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  aria-label="חיפוש לפי שם או מק״ט"
                />
              </form>
            )}
            <Link to="/favorites" className="icon-link" aria-label="מועדפים" title="מועדפים">
              <IconHeart size={22} filled={favCount > 0} />
              {favCount > 0 && <span className="badge-count">{favCount}</span>}
            </Link>
            {!loggedIn && (
              <Link to="/signup" className="icon-link mobile-only-icon" aria-label="הרשמה" title="הרשמה">
                <IconUserPlus size={22} />
              </Link>
            )}
            <Link
              to={accountPath()}
              className={`icon-link${inCustomerArea ? ' is-active' : ''}`}
              aria-label={loggedIn ? 'אזור אישי' : 'התחברות'}
              aria-current={inCustomerArea ? 'page' : undefined}
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
        <form className="page-search" onSubmit={submitSearch}>
          <input
            type="search"
            placeholder="חיפוש לפי שם או מק״ט..."
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            aria-label="חיפוש לפי שם או מק״ט"
          />
        </form>
        <nav className={`main-nav${navOpen ? ' is-open' : ''}`}>
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={loggedIn && n.to === '/plans' ? '/account/plans' : n.to}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              {n.label}
            </NavLink>
          ))}
          {loggedIn && (
            <div className="nav-extra">
              <NavLink to={accountPath()}>אזור אישי</NavLink>
            </div>
          )}
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
              תכשיטים יוקרתיים במודל מנוי. בוחרות, עונדות, מחליפות.
              <br />
              NEW LOOK. SAME YOU.
            </p>
          </div>
          <details className="footer-group" open={footerWide || undefined}>
            <summary>
              <Link to="/about" className="footer-head-link">עלינו</Link>
            </summary>
            <div className="footer-links">
              <Link to="/how">איך זה עובד</Link>
              <Link to={loggedIn ? '/account/plans' : '/plans'}>מסלולי מנוי</Link>
              <Link to="/catalog">תכשיטים</Link>
              <Link to="/about">אודות</Link>
            </div>
          </details>
          <details className="footer-group" open={footerWide || undefined}>
            <summary>
              <Link to={loggedIn ? accountPath() : '/login'} className="footer-head-link">
                חשבון
              </Link>
            </summary>
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
          <details className="footer-group" open={footerWide || undefined}>
            <summary>משפטי</summary>
            <div className="footer-links">
              <Link to="/terms">תקנון והסכם מנוי</Link>
              <Link to="/privacy">מדיניות פרטיות</Link>
              <Link to="/cookies">מדיניות עוגיות</Link>
            </div>
          </details>
          <details className="footer-group" open={footerWide || undefined}>
            <summary>צריכים עזרה</summary>
            <div className="footer-links">
              <Link to="/contact">צור קשר</Link>
              <Link to="/how#faq">שאלות נפוצות</Link>
              <a href={`tel:${SERVICE_PHONE_TEL}`} dir="ltr">{SERVICE_PHONE}</a>
              <a href={`mailto:${SERVICE_EMAIL}`} dir="ltr">{SERVICE_EMAIL}</a>
              <span className="footer-hours">{SERVICE_HOURS}</span>
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
      <CookieBanner />
      <PalettePicker />
    </>
  );
}
