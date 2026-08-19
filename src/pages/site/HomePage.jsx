import { Link } from 'react-router-dom';
import { useApp } from '../../state/AppContext';
import { enrichPlan } from '../../lib/plans';
import Art from '../../components/Art';
import { IconDiamond, IconRefresh, IconShield, IconTruck } from '../../components/icons';

const HERO_BENEFITS = [
  { icon: IconDiamond, t: 'תכשיטי יוקרה' },
  { icon: IconRefresh, t: 'החלפה חופשית' },
  { icon: IconTruck, t: 'משלוח עד הבית' },
  { icon: IconShield, t: 'ביטוח בלאי סביר' },
];

export default function HomePage() {
  const { state } = useApp();
  const featured = (state?.products || []).slice(0, 4);
  const plans = (state?.plans || []).map(enrichPlan);

  return (
    <>
      <Link to="/signup" className="hero-band" aria-label="תכשיטים יוקרתיים במנוי חודשי — הצטרפי עכשיו">
        <img className="hb-mobile" src="/photos/hero-full2.jpg" alt="" />
        <div className="hb-text">
          <span className="hb-kicker" dir="ltr">
            NEW LOOK. SAME YOU.
          </span>
          <h1>
            תכשיטים יוקרתיים.
            <br />
            לכל רגע. כל הזמן.
          </h1>
          <div className="hb-divider">
            <span className="ln" />
            <img src="/brand/symbol-gold.png" alt="" />
            <span className="ln" />
          </div>
          <p>
            מגוון מתחדש של תכשיטים יוקרתיים
            <br />
            במנוי חודשי ללא התחייבות.
          </p>
          <div className="hb-benefits">
            {HERO_BENEFITS.map((b) => (
              <span className="hb-benefit" key={b.t}>
                <b.icon size={34} />
                <span>{b.t}</span>
              </span>
            ))}
          </div>
          <span className="btn btn-tan hb-cta">אני רוצה להתחיל</span>
        </div>
      </Link>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>מהקטלוג שלנו</h2>
            <p>טעימה קטנה ממה שמחכה לך בפנים.</p>
          </div>
          <div className="products-grid">
            {featured.map((p) => (
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
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link to="/catalog" className="btn btn-outline">
              לקטלוג המלא
            </Link>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <div className="section-head">
            <h2>מסלולי מנוי</h2>
            <p>בחרי את המסלול שהכי מתאים לך — אפשר לשדרג או לבטל בכל עת.</p>
          </div>
          <div className="plans-grid">
            {plans.map((plan) => (
              <div key={plan.id} className={`plan-card${plan.featured ? ' featured' : ''}`}>
                {plan.featured && <div className="flag">הכי פופולרי</div>}
                <div className="plan-name">{plan.latin}</div>
                <div className="price">
                  ₪{plan.price}
                  <small> לחודש</small>
                </div>
                <div className="materials">{plan.materials}</div>
                <ul>
                  {plan.perks.slice(0, 3).map((perk) => (
                    <li key={perk}>{perk}</li>
                  ))}
                </ul>
                <Link to="/plans" className={`btn${plan.featured ? ' btn-tan' : ''}`}>
                  אני בוחרת
                </Link>
              </div>
            ))}
          </div>
          <div className="plans-note-line">
            ללא התחייבות<span className="dot">•</span>ניתן לבטל בכל עת
          </div>
        </div>
      </section>

      <section className="cta-band" style={{ backgroundImage: 'url(/photos/bg-cream.jpg)' }}>
        <div className="tagline">NEW LOOK. SAME YOU.</div>
        <h2>מוכנה להתחיל לנצנץ?</h2>
        <p>ההרשמה לוקחת כמה דקות — והתכשיטים הראשונים כבר בדרך אלייך.</p>
        <Link to="/signup" className="btn">
          הצטרפי עכשיו
        </Link>
      </section>
    </>
  );
}
