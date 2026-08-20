import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../state/AppContext';
import Art from '../../components/Art';

const CATALOG_TABS = [
  { id: 'הכל', label: 'כל הקולקציות' },
  { id: 'טבעות', label: 'טבעות' },
  { id: 'עגילים', label: 'עגילים' },
  { id: 'שרשראות', label: 'שרשראות ותליונים' },
  { id: 'צמידים', label: 'צמידים' },
  { id: 'new', label: 'NEW IN', latin: true },
];

const NEW_IN_COUNT = 6;

export default function CatalogPage() {
  const { state } = useApp();
  const [cat, setCat] = useState('הכל');

  const items = useMemo(() => {
    const products = state?.products || [];
    const newInIds = new Set(products.slice(0, NEW_IN_COUNT).map((p) => p.id));
    return products.filter((p) =>
      cat === 'הכל' || (cat === 'new' ? newInIds.has(p.id) : p.category === cat),
    );
  }, [state?.products, cat]);

  return (
    <>
      <div className="page-head container">
        <h1>תכשיטים</h1>
      </div>

      <section className="section" style={{ paddingTop: 36 }}>
        <div className="container">
          <div className="catalog-toolbar">
            <div className="tabs">
              {CATALOG_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`tab${cat === tab.id ? ' on' : ''}${tab.latin ? ' tab-latin' : ''}`}
                  onClick={() => setCat(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="products-grid">
            {items.map((p) => (
              <Link to={`/catalog/${p.id}`} key={p.id} className="product-card">
                <div className="art">
                  <Art product={p} />
                </div>
                <div className="info">
                  <div className="name">{p.name}</div>
                  <div className="meta">
                    {p.metal} · {p.stone}
                  </div>
                  <div className="row">
                    <span className="points-badge">{p.points} נק׳</span>
                    {p.price ? (
                      <span className="price-tag">₪{Number(p.price).toLocaleString()} לקנייה</span>
                    ) : null}
                    {!p.inStock && <span className="oos">אזל מהמלאי</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {items.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--muted)' }}>אין פריטים תואמים כרגע.</p>
          )}
        </div>
      </section>
    </>
  );
}
