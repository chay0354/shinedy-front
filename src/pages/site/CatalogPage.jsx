import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageSlot from '../../components/ImageSlot';
import { api } from '../../api';
import { useApp } from '../../state/AppContext';

const CATEGORIES = ['הכל', 'עגילים', 'טבעות', 'שרשראות', 'צמידים'];

const SORTS = [
  { id: 'default', label: 'מיון' },
  { id: 'points-asc', label: 'נקודות: מהנמוך' },
  { id: 'points-desc', label: 'נקודות: מהגבוה' },
  { id: 'name', label: 'לפי שם' },
];

const METALS = ['הכל', 'זהב צהוב', 'זהב רוזה', 'כסף'];

export default function CatalogPage() {
  const { state, run } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('הכל');
  const [metal, setMetal] = useState('הכל');
  const [sort, setSort] = useState('default');
  const subscribed = Boolean(state?.subscribed);

  const productList = subscribed
    ? state?.catalogProducts || state?.products || []
    : state?.products || [];

  const products = useMemo(() => {
    let list = [...productList];
    if (filter !== 'הכל') list = list.filter((p) => p.category === filter);
    if (metal !== 'הכל') list = list.filter((p) => p.metal === metal);
    if (sort === 'points-asc') list.sort((a, b) => a.points - b.points);
    if (sort === 'points-desc') list.sort((a, b) => b.points - a.points);
    if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name, 'he'));
    return list;
  }, [productList, filter, metal, sort]);

  async function handleAdd(p) {
    if (!subscribed) {
      navigate('/plans');
      return;
    }
    const data = await run(() => api.addToCart(p.id));
    if (!data) return;
    navigate('/account/cart');
  }

  return (
    <section className="site-section">
      <div className="shell">
        <div className="section-head">
          <h2 className="section-title">קטלוג תכשיטים</h2>
          <p className="section-sub">
            {subscribed
              ? `נקודות זמינות: ${state.remaining} מתוך ${state.pointsTotal}`
              : 'להזמנה יש לבחור מסלול מנוי'}
          </p>
        </div>

        <div className="catalog-toolbar">
          <div className="chip-row">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                className={`chip${filter === c ? ' active' : ''}`}
                onClick={() => setFilter(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="select-row">
            <select className="select" value={metal} onChange={(e) => setMetal(e.target.value)}>
              {METALS.map((m) => (
                <option key={m} value={m}>
                  {m === 'הכל' ? 'חומר' : m}
                </option>
              ))}
            </select>
            <select className="select" value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="empty">לא נמצאו תכשיטים בסינון הנוכחי</div>
        ) : (
          <div className="product-grid">
            {products.map((p) => (
              <article key={p.id} className="product-card">
                <div className="product-media" onClick={() => navigate(`/catalog/${p.id}`)}>
                  <ImageSlot label={p.name} category={p.category} productId={p.id} />
                </div>
                <div className="product-body">
                  <h3 className="product-name" onClick={() => navigate(`/catalog/${p.id}`)}>
                    {p.name}
                  </h3>
                  <p className="product-meta">
                    {p.metal} · {p.stone}
                  </p>
                  <div className="product-foot">
                    <div className="product-points">
                      {p.points} <span>נקודות</span>
                    </div>
                    <button
                      type="button"
                      className="btn-mini"
                      disabled={subscribed ? p.addDisabled : false}
                      onClick={() => handleAdd(p)}
                    >
                      {subscribed ? p.buttonLabel || 'הוסיפי לסל' : 'הצטרפי'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
