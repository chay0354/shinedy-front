import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useApp } from '../state/AppContext';
import { isAdmin, isStaff } from '../lib/roles';
import { getToken } from '../lib/auth';
import { IconBag, IconUser } from '../components/icons';

const NAV = [
  { to: '/', label: 'דף הבית', end: true },
  { to: '/how', label: 'איך זה עובד' },
  { to: '/plans', label: 'מסלולים' },
  { to: '/catalog', label: 'קטלוג' },
  { to: '/info', label: 'שאלות נפוצות' },
];

export default function SiteLayout() {
  const { state } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const cartCount = state?.cart?.length || 0;

  useEffect(() => {
    if (!getToken() || isAuthPage) return;
    if (isAdmin(state)) {
      navigate('/admin/products', { replace: true });
      return;
    }
    if (isStaff(state)) {
      navigate('/warehouse/orders', { replace: true });
      return;
    }
    // Logged-in customers: plan selection stays inside account layout (with sidebar)
    if (location.pathname === '/plans' && state && !state.subscribed) {
      navigate('/account/plans', { replace: true });
    }
  }, [state, navigate, isAuthPage, location.pathname]);

  function goToAccount() {
    if (!getToken()) {
      navigate('/login');
      return;
    }
    navigate(state?.subscribed ? '/account/me' : '/account/plans');
  }

  function goToCart() {
    navigate(getToken() && state?.subscribed ? '/account/cart' : '/plans');
  }

  return (
    <>
      <header className="site-header">
        <div className="site-topbar">
          <button type="button" className="site-brand" onClick={() => navigate('/')}>
            SHINEDY
          </button>
          <div className="site-actions">
            <button type="button" className="icon-btn" aria-label="אזור אישי" onClick={goToAccount}>
              <IconUser />
            </button>
            <button
              type="button"
              className="icon-btn icon-btn-badge"
              aria-label="סל הקניות"
              onClick={goToCart}
            >
              <IconBag />
              {cartCount > 0 ? <span>{cartCount}</span> : null}
            </button>
          </div>
        </div>
        <nav className="site-nav">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="site-main">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">SHINEDY</div>
          <div className="footer-links">
            <NavLink to="/how">איך זה עובד</NavLink>
            <NavLink to="/plans">מסלולים</NavLink>
            <NavLink to="/catalog">קטלוג</NavLink>
            <NavLink to="/info">שאלות נפוצות</NavLink>
          </div>
          <div className="footer-copy">© 2026 Shinedy</div>
        </div>
      </footer>
    </>
  );
}
