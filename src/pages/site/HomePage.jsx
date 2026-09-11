import { Link } from 'react-router-dom';
import { useApp } from '../../state/AppContext';
import { getToken } from '../../lib/auth';
import { hasActivePlan } from '../../lib/roles';
import { publicCatalogPlans } from '../../lib/plans';
import ProductCard from '../../components/ProductCard';
import { IconDiamond, IconRefresh, IconShield, IconTruck } from '../../components/icons';

const HERO_BENEFITS = [
  { icon: IconDiamond, t: 'תכשיטי יוקרה' },
  { icon: IconRefresh, t: 'החלפה חופשית' },
  { icon: IconTruck, t: 'משלוח עד הבית' },
  { icon: IconShield, t: 'ביטוח בלאי סביר' },
];

function BrandMark() {
  return (
    <div className="brand-mark" aria-hidden="true">
      <span className="ln" />
      <img src="/brand/symbol-black@2x.png" alt="" />
      <span className="ln" />
    </div>
  );
}

export default function HomePage() {
  const { state } = useApp();
  const products = state?.products || [];
  const featured = products.slice(0, 4);
  const plans = publicCatalogPlans(state?.plans);
  const loggedIn = Boolean(getToken() && state?.auth);
  const subscribed = hasActivePlan(state);
  const memberHref = subscribed ? '/catalog' : '/account/plans';
  const HeroTag = loggedIn ? 'div' : Link;
  const heroProps = loggedIn
    ? { className: 'hero-band' }
    : { to: '/signup', className: 'hero-band', 'aria-label': 'תכשיטים יוקרתיים במנוי חודשי — הצטרפי עכשיו' };

  return (
    <>
      <HeroTag {...heroProps}>
        <div className="hb-art">
          <img className="hb-mobile" src="/photos/hero-full2.jpg" alt="" />
          <span className="hb-kicker hb-kicker-art" dir="ltr">
            NEW LOOK. SAME YOU.
          </span>
        </div>
        <div className="hb-text">
          <span className="hb-kicker hb-kicker-text" dir="ltr">
            NEW LOOK. SAME YOU.
          </span>
          <h1>
            תכשיטים יוקרתיים.
            <br />
            לכל רגע. כל הזמן.
          </h1>
          <BrandMark />
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
          {loggedIn ? (
            <Link to={memberHref} className="btn hb-cta">
              {subscribed ? 'לקטלוג התכשיטים' : 'לבחירת מסלול'}
            </Link>
          ) : (
            <span className="btn hb-cta">אני רוצה להתחיל</span>
          )}
        </div>
      </HeroTag>

      <section className="home-trust" aria-label="יתרונות השירות">
        {HERO_BENEFITS.map((b) => (
          <div className="home-trust-item" key={b.t}>
            <b.icon size={18} />
            <span>{b.t}</span>
          </div>
        ))}
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div className="section-eyebrow" dir="ltr">THE COLLECTION</div>
            <h2>מהקטלוג שלנו</h2>
            <BrandMark />
            <p>טעימה קטנה ממה שמחכה לך בפנים.</p>
          </div>
          <div className="products-grid">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} products={products} />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link to="/catalog" className="btn btn-outline">
              לקטלוג המלא
            </Link>
          </div>
        </div>
      </section>

      {!loggedIn && (
      <section className="section alt">
        <div className="container">
          <div className="section-head">
            <div className="section-eyebrow" dir="ltr">MEMBERSHIP</div>
            <h2>מסלולי המנוי</h2>
            <BrandMark />
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
                <Link
                  to="/signup"
                  state={{ plan: plan.id }}
                  className={`btn${plan.featured ? ' btn-tan' : ''}`}
                >
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
      )}

      <section className="cta-band" style={{ backgroundImage: 'url(/photos/bg-cream.jpg)' }}>
        <div className="tagline">NEW LOOK. SAME YOU.</div>
        <BrandMark />
        {loggedIn ? (
          <>
            <h2>{subscribed ? 'מוכנה לבחור תכשיטים?' : 'נשאר רק לבחור מסלול'}</h2>
            <p>
              {subscribed
                ? 'הקטלוג מחכה — אפשר להוסיף לקופסה ולהמשיך מהאזור האישי.'
                : 'החשבון כבר פתוח. בחרי מסלול כדי להתחיל לבחור תכשיטים.'}
            </p>
            <Link to={memberHref} className="btn">
              {subscribed ? 'לקטלוג התכשיטים' : 'לבחירת מסלול'}
            </Link>
          </>
        ) : (
          <>
            <h2>מוכנה להתחיל לנצנץ?</h2>
            <p>ההרשמה לוקחת כמה דקות — והתכשיטים הראשונים כבר בדרך אלייך.</p>
            <Link to="/signup" className="btn">
              הצטרפי עכשיו
            </Link>
          </>
        )}
      </section>
    </>
  );
}
