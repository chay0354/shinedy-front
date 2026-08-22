import { Link } from 'react-router-dom';
import { useApp } from '../../state/AppContext';
import { useFavorites } from '../../lib/favorites';
import ProductCard from '../../components/ProductCard';

export default function FavoritesPage() {
  const { state } = useApp();
  const { ids } = useFavorites();
  const products = state?.products || [];
  const items = ids.map((id) => products.find((p) => p.id === id)).filter(Boolean);

  return (
    <>
      <div className="page-head container">
        <h1>מועדפים</h1>
        <p>התכשיטים שסימנת בלב — לחזרה מהירה כשתרצי להזמין.</p>
      </div>

      <section className="section" style={{ paddingTop: 36 }}>
        <div className="container">
          {items.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--muted)' }}>
              עדיין אין מועדפים.{' '}
              <Link to="/catalog" className="link-gold">
                לקטלוג
              </Link>
            </p>
          ) : (
            <div className="products-grid">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} products={products} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
