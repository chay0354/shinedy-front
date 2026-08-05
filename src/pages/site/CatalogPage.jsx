import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageSlot from '../../components/ImageSlot';
import { api } from '../../api';
import { useApp } from '../../state/AppContext';

const CATEGORIES = [
  { id: 'הכל', label: 'הכל' },
  { id: 'טבעות', label: 'טבעות' },
  { id: 'שרשראות', label: 'שרשראות' },
  { id: 'עגילים', label: 'עגילים' },
  { id: 'צמידים', label: 'צמידים' },
];

const CATEGORY_ORDER = CATEGORIES.filter((c) => c.id !== 'הכל').map((c) => c.id);

export default function CatalogPage() {
  const { state, run } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('הכל');
  const subscribed = Boolean(state?.subscribed);

  const productList = subscribed
    ? state?.catalogProducts || state?.products || []
    : state?.products || [];

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

  async function handleBuy(p) {
    if (!subscribed) {
      navigate('/plans');
      return;
    }
    await run(() => api.addToCart(p.id));
    navigate('/account/cart');
  }

  return (
    <div className="page store-catalog" style={{ paddingTop: 36 }}>
      <div className="store-catalog-head">
        <div>
          <h2 className="store-section-title">קטלוג</h2>
          <p className="muted" style={{ margin: '6px 0 0', fontSize: 14 }}>
            {subscribed
              ? `נקודות זמינות: ${state.remaining} / ${state.pointsTotal}`
              : 'להזמנה יש לבחור מסלול מנוי'}
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
                  {filter !== 'הכל' && <div className="store-card-tag">{p.category}</div>}
                </div>
                <div className="store-card-body">
                  <h3 style={{ cursor: 'pointer' }} onClick={() => navigate(`/catalog/${p.id}`)}>
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
                      className="btn btn-sm"
                      disabled={subscribed ? p.addDisabled : false}
                      onClick={() => handleBuy(p)}
                    >
                      {subscribed ? p.buttonLabel || 'הוסיפי לסל' : 'הצטרפי כדי להזמין'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
