import { useNavigate } from 'react-router-dom';
import { useApp } from '../../state/AppContext';
import ImageSlot from '../../components/ImageSlot';
import Button from '../../components/Button';
import {
  IconCalendar,
  IconDiamond,
  IconRefresh,
  IconTruck,
  JewelArt,
} from '../../components/icons';

const VALUES = [
  { icon: <IconDiamond />, label: 'מגוון אינסופי של תכשיטים' },
  { icon: <IconCalendar />, label: 'מוצר חדש בכל חודש' },
  { icon: <IconTruck />, label: 'משלוח והחזרה ללא עלות' },
  { icon: <IconRefresh />, label: 'החלפה ללא הגבלה' },
];

export default function HomePage() {
  const { state } = useApp();
  const navigate = useNavigate();
  const subscribed = Boolean(state?.subscribed);
  const featured = (state?.products || []).slice(0, 8);

  return (
    <div className="home-page">
      <section className="hero-banner">
        <div className="hero-photo" aria-hidden="true" />
        <div className="hero-figure" aria-hidden="true">
          <JewelArt variant="necklace" />
        </div>
        <div className="hero-inner">
          <div className="hero-copy">
            <h1 className="hero-title">
              תכשיטים יוקרתיים.
              <br />
              לכל רגע. כל הזמן.
            </h1>
            <p className="hero-sub">מנוי חודשי גמיש · החלפות ללא הגבלה</p>
            <div className="hero-actions">
              <Button
                type="button"
                className="btn-gold"
                onClick={() => navigate(subscribed ? '/account/shop' : '/plans')}
              >
                {subscribed ? 'לחנות שלי' : 'לצפייה במסלולים'}
              </Button>
              <Button type="button" className="btn-outline" onClick={() => navigate('/catalog')}>
                לקטלוג
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="value-strip">
        <div className="value-strip-inner">
          {VALUES.map((v) => (
            <div key={v.label} className="value-item">
              {v.icon}
              <span>{v.label}</span>
            </div>
          ))}
        </div>
      </div>

      <section className="site-section">
        <div className="shell">
          <div className="section-head">
            <h2 className="section-title">הקולקציה שלנו</h2>
            <p className="section-sub">תכשיטים נבחרים שמתחלפים בכל חודש</p>
          </div>

          <div className="product-grid">
            {featured.map((p) => (
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
                      onClick={() => navigate(`/catalog/${p.id}`)}
                    >
                      לפרטים
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="section-cta">
            <Button type="button" className="btn-ink" onClick={() => navigate('/catalog')}>
              לכל הקטלוג
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
