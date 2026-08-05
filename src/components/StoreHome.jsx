import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageSlot from './ImageSlot';
import { api } from '../api';
import { useApp } from '../state/AppContext';

const CATEGORIES = [
  { id: 'הכל', label: 'הכל' },
  { id: 'טבעות', label: 'טבעות' },
  { id: 'שרשראות', label: 'שרשראות' },
  { id: 'עגילים', label: 'עגילים' },
  { id: 'צמידים', label: 'צמידים' },
];

const CATEGORY_ORDER = CATEGORIES.filter((c) => c.id !== 'הכל').map((c) => c.id);

/**
 * Boutique store home.
 * guest=true → public version; buy/add sends user to /plans
 * guest=false → member shop with real cart
 */
export default function StoreHome({ guest = false, hideHero = false }) {
  const { state, run } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('הכל');
  const cartCount = state?.cart?.length || 0;
  const subscribed = Boolean(state?.subscribed);

  const productList = guest
    ? state?.products || []
    : state?.catalogProducts || state?.products || [];

  const products = useMemo(() => {
    return filter === 'הכל' ? productList : productList.filter((p) => p.category === filter);
  }, [productList, filter]);

  const groupedSections = useMemo(() => {
    if (filter !== 'הכל') {
      return [{ category: filter, items: products }];
    }
    return CATEGORY_ORDER
      .map((category) => ({
        category,
        items: productList.filter((p) => p.category === category),
      }))
      .filter((section) => section.items.length > 0);
  }, [filter, products, productList]);

  const featured = productList.slice(0, 3);
  const pointsPct = state?.pointsTotal
    ? Math.round(((state.remaining ?? 0) / state.pointsTotal) * 100)
    : 0;

  async function handleBuy(product) {
    if (!subscribed || guest) {
      navigate('/plans');
      return;
    }
    await run(() => api.addToCart(product.id));
  }

  function buyLabel(p) {
    if (!subscribed || guest) return 'הצטרפי כדי להזמין';
    return p.buttonLabel || 'הוסיפי לסל';
  }

  function buyDisabled(p) {
    if (!subscribed || guest) return false;
    return Boolean(p.addDisabled);
  }

  return (
    <div className={`store${hideHero ? ' store-embedded' : ''}`}>
      {!hideHero && (
        <>
          <section className="store-hero">
            <div className="store-hero-glow" aria-hidden="true" />
            <div className="store-hero-copy">
              <p className="store-kicker">Shinedy Boutique</p>
              <h1 className="store-title">
                החנות
                <span>
                  {guest
                    ? 'תכשיטים במנוי — לובשים, מחליפים, נהנים'
                    : 'תכשיטים שנבחרו בשבילך'}
                </span>
              </h1>
              <p className="store-lead">
                {guest
                  ? 'עברי על הקולקציה, בחרי מסלול שמגיע עם נקודות חודשיות, והתחילי להזמין. רוצה פריט? קודם בוחרים מסלול.'
                  : 'בחרי מהקולקציה עד מכסת הנקודות של המסלול. כל פריט מגיע עם נוכחות, והחלפה כשמתחשק משהו חדש.'}
              </p>
              <div className="store-hero-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() =>
                    document.getElementById('store-catalog')?.scrollIntoView({ behavior: 'smooth' })
                  }
                >
                  לקטלוג
                </button>
                {guest || !subscribed ? (
                  <button type="button" className="btn" onClick={() => navigate('/plans')}>
                    לצפייה במסלולים
                  </button>
                ) : (
                  <button type="button" className="btn" onClick={() => navigate('/account/cart')}>
                    הזמנה נוכחית ({cartCount})
                  </button>
                )}
              </div>
            </div>

            <div className="store-hero-aside">
              {guest || !subscribed ? (
                <div className="store-points-card store-guest-card">
                  <div className="store-points-label">איך מתחילים</div>
                  <div className="store-guest-steps">
                    <div>
                      <strong>01</strong>
                      <span>בוחרים מסלול</span>
                    </div>
                    <div>
                      <strong>02</strong>
                      <span>מקבלים נקודות</span>
                    </div>
                    <div>
                      <strong>03</strong>
                      <span>מזמינים תכשיטים</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: 18, background: '#d4b06a', color: '#1a1815' }}
                    onClick={() => navigate('/plans')}
                  >
                    בחרי מסלול
                  </button>
                </div>
              ) : (
                <div className="store-points-card">
                  <div className="store-points-label">יתרת נקודות לבחירה</div>
                  <div className="store-points-value">
                    <span>{state.remaining}</span>
                    <small>/ {state.pointsTotal}</small>
                  </div>
                  <div className="store-points-bar">
                    <div style={{ width: `${Math.max(0, Math.min(100, pointsPct))}%` }} />
                  </div>
                  <div className="store-points-meta">
                    מסלול {state.plan?.name} · ₪{state.plan?.price}/חודש
                  </div>
                </div>
              )}

              <div className="store-featured-mini">
                {featured.map((p, i) => (
                  <div
                    key={p.id}
                    className="store-featured-chip"
                    style={{ animationDelay: `${i * 0.12}s`, cursor: 'pointer' }}
                    onClick={() => navigate(`/catalog/${p.id}`)}
                  >
                    <div className="thumb" style={{ width: 52, height: 52 }}>
                      <ImageSlot
                        label={p.name}
                        category={p.category}
                        productId={p.id}
                        className="compact"
                      />
                    </div>
                    <div>
                      <div className="store-featured-name">{p.name}</div>
                      <div className="accent" style={{ fontSize: 12, fontWeight: 600 }}>
                        {p.points} נק׳
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="store-strip" aria-label="יתרונות">
            <div>
              <strong>01</strong>
              <span>בחירה לפי נקודות</span>
            </div>
            <div>
              <strong>02</strong>
              <span>החלפה בכל רגע</span>
            </div>
            <div>
              <strong>03</strong>
              <span>משלוח מסודר עד הבית</span>
            </div>
          </section>
        </>
      )}

      {hideHero && subscribed && !guest && (
        <div className="store-mini-bar">
          <div>
            נקודות זמינות: <b className="accent">{state.remaining}</b> / {state.pointsTotal}
          </div>
          <button type="button" className="btn btn-sm" onClick={() => navigate('/account/cart')}>
            הזמנה נוכחית ({cartCount})
          </button>
        </div>
      )}

      <section id="store-catalog" className="store-catalog">
        <div className="store-catalog-head">
          <div>
            <h2 className="store-section-title">הקולקציה</h2>
            <p className="muted" style={{ margin: '6px 0 0', fontSize: 14 }}>
              {products.length} פריטים{filter !== 'הכל' ? ` ב${filter}` : ''}
              {(guest || !subscribed) && ' · להזמנה יש לבחור מסלול'}
            </p>
          </div>
          <div className="store-filters">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`store-filter${filter === c.id ? ' active' : ''}`}
                onClick={() => setFilter(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {groupedSections.map((section) => (
          <div key={section.category} className="store-category-block">
            <div className="store-category-header">
              <h3 className="store-category-title">{section.category}</h3>
              <span className="muted" style={{ fontSize: 13 }}>
                {section.items.length} פריטים
              </span>
            </div>
            <div className="store-grid">
              {section.items.map((p, i) => (
                <article
                  key={p.id}
                  className="store-card"
                  style={{ animationDelay: `${(i % 8) * 0.05}s` }}
                >
                  <div
                    className="store-card-media"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/catalog/${p.id}`)}
                  >
                    <ImageSlot label={p.name} category={p.category} productId={p.id} />
                    {filter === 'הכל' ? null : (
                      <div className="store-card-tag">{p.category}</div>
                    )}
                    {p.availCount === 0 && <div className="store-card-sold">אזל מהמלאי</div>}
                  </div>
                  <div className="store-card-body">
                    <h3
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/catalog/${p.id}`)}
                    >
                      {p.name}
                    </h3>
                    <p>
                      {p.metal} · {p.stone}
                    </p>
                    <div className="store-card-foot">
                      <div>
                        <span className="store-card-points">{p.points}</span>
                        <span className="muted"> נקודות</span>
                        <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>
                          {p.availLabel}
                        </div>
                      </div>
                      <button
                        type="button"
                        className={`btn btn-sm${p.inCart && subscribed && !guest ? ' btn-primary' : ''}`}
                        disabled={buyDisabled(p)}
                        onClick={() => handleBuy(p)}
                      >
                        {buyLabel(p)}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <div className="empty" style={{ marginTop: 24 }}>
            אין פריטים בקטגוריה זו
          </div>
        )}
      </section>
    </div>
  );
}
