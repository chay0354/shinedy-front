import { useEffect, useRef, useState } from 'react';
import { usePreferStillMedia } from '../../lib/media';
import { Link } from 'react-router-dom';
import { useApp } from '../../state/AppContext';
import { getToken } from '../../lib/auth';
import { hasActivePlan } from '../../lib/roles';
import { planShowcase, publicCatalogPlans } from '../../lib/plans';
import CutoutImage from '../../components/CutoutImage';
import ProductCard from '../../components/ProductCard';
import HeroArt, { CyclingKicker } from '../../components/HeroArt';
import { IconDiamond, IconRefresh, IconShield, IconTruck } from '../../components/icons';
import { STEPS } from './HowPage';

const HERO_LINES = ['UNLIMIT YOUR LOOK', 'NEW LOOK, UNLIMITED'];

const PLAN_TIERS = {
  silver: ['silver'],
  combined: ['combined', 'silver'],
  gold: ['gold', 'combined', 'silver'],
};

function pieceForPlan(products, planId) {
  const allowed = PLAN_TIERS[planId] || [];
  const shots = products.filter((product) => product.image && allowed.includes(product.minPlan));
  const preferred = shots.filter((product) => product.minPlan === allowed[0]);
  const pool = preferred.length ? preferred : shots;
  const best = [...pool].sort((a, b) => (b.points || 0) - (a.points || 0))[0];
  if (best) return best;
  const withImage = products.filter((product) => product.image);
  return [...withImage].sort((a, b) => (a.points || 0) - (b.points || 0))[0] || null;
}

const HERO_BENEFITS = [
  { icon: IconDiamond, t: 'תכשיטי יוקרה' },
  { icon: IconRefresh, t: 'החלפה חופשית' },
  { icon: IconTruck, t: 'משלוח עד הבית' },
  { icon: IconShield, t: 'ביטוח בלאי סביר' },
];

export default function HomePage() {
  const { state } = useApp();
  const products = state?.products || [];
  const featured = products.slice(0, 4);
  const plans = publicCatalogPlans(state?.plans);
  const ctaVideoRef = useRef(null);
  const trustRef = useRef(null);
  const [trustIn, setTrustIn] = useState(false);
  const stillMedia = usePreferStillMedia();
  const loggedIn = Boolean(getToken() && state?.auth);
  const subscribed = hasActivePlan(state);
  const memberHref = subscribed ? '/catalog' : '/account/plans';

  useEffect(() => {
    const node = trustRef.current;
    if (!node) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTrustIn(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setTrustIn(true);
        io.disconnect();
      },
      { threshold: 0.35 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const node = ctaVideoRef.current;
    if (!node) return undefined;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      if (motion.matches) node.pause();
      else node.play().catch(() => {});
    };
    sync();
    motion.addEventListener('change', sync);
    return () => motion.removeEventListener('change', sync);
  }, []);

  return (
    <div className="home">
      <section className="hero-band">
        <HeroArt
          video="/hero/look.mp4"
          poster="/hero/look.jpg"
          label="דוגמנית עונדת עגילי זהב"
          showKicker={false}
        />
        <div className="hb-text">
          <div className="hb-cluster">
          <CyclingKicker lines={HERO_LINES} className="hb-eyebrow" />
          <span className="hb-rule" aria-hidden="true" />
          <div className="hb-actions">
            <Link to={loggedIn ? memberHref : '/catalog'} className="btn btn-tan hb-cta">
              {loggedIn && !subscribed ? 'לבחירת מסלול' : 'לצפייה בקולקציה'}
            </Link>
            <Link to="/how" className="btn hb-cta hb-cta-ghost">
              איך זה עובד
            </Link>
          </div>
          </div>
        </div>
      </section>

      <section className="home-intro">
        <div className="container">
          <h1>מגוון מתחדש של תכשיטים יוקרתיים במנוי חודשי, ללא התחייבות</h1>
        </div>
      </section>

      <section
        ref={trustRef}
        className={`home-trust${trustIn ? ' is-shown' : ''}`}
        aria-label="יתרונות השירות"
      >
        {HERO_BENEFITS.map((b) => (
          <div className="home-trust-item" key={b.t}>
            <b.icon size={28} />
            <span>
              {b.t.includes(' ') ? (
                <>
                  {b.t.split(' ')[0]}
                  <br />
                  {b.t.split(' ').slice(1).join(' ')}
                </>
              ) : (
                b.t
              )}
            </span>
          </div>
        ))}
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div className="section-eyebrow" dir="ltr">THE COLLECTION</div>
            <h2>מהקטלוג שלנו</h2>
          </div>
          <div className="products-grid">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} products={products} />
            ))}
          </div>
          <div className="section-action">
            <Link to="/catalog" className="btn btn-outline">
              לקטלוג המלא
            </Link>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <div className="section-head">
            <div className="section-eyebrow" dir="ltr">HOW IT WORKS</div>
            <h2>איך זה עובד?</h2>
            <p>פשוט. גמיש. מותאם לך.</p>
          </div>
          <div className="how-steps">
            {STEPS.map((s) => (
              <div className="how-step" key={s.t}>
                <div className="circle">
                  <s.icon size={38} />
                </div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
          <div className="section-action">
            <Link
              to={loggedIn ? memberHref : '/plans'}
              className="btn btn-tan"
            >
              {subscribed ? 'לקטלוג התכשיטים' : 'לבחירת מסלול'}
            </Link>
          </div>
        </div>
      </section>

      {!loggedIn && (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <div className="section-eyebrow" dir="ltr">MEMBERSHIP</div>
              <h2>מסלולי המנוי</h2>
              <p>בחרי את המסלול שהכי מתאים לך. אפשר לשדרג או לבטל בכל עת.</p>
            </div>
            <div className="plans-grid">
              {plans.map((plan) => {
                const piece = pieceForPlan(products, plan.id);
                return (
                <div key={plan.id} className={`plan-card${plan.featured ? ' featured' : ''}`}>
                  {plan.featured && <div className="flag">הכי פופולרי</div>}
                  {piece && (
                    <div className="plan-shot">
                      <CutoutImage src={piece.image} alt={piece.name || ''} />
                    </div>
                  )}
                  <div className="plan-name">{planShowcase(plan)}</div>
                  <div className="materials">{plan.materials}</div>
                  <div className="price">
                    ₪{plan.price}
                    <small> לחודש</small>
                  </div>
                  <div className="plan-points">{plan.points} נקודות לבחירת תכשיטים</div>
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
                    בואי נתחיל
                  </Link>
                </div>
                );
              })}
            </div>
            <div className="plans-note-line">
              ללא התחייבות<span className="dot">•</span>ניתן לבטל בכל עת
            </div>
          </div>
        </section>
      )}

      <section className={`cta-band${stillMedia ? ' has-still' : ' has-video'}`}>
        {!stillMedia && (
        <video
          ref={ctaVideoRef}
          className="cta-video"
          autoPlay
          muted
          loop
          playsInline
          poster="/hero/look.jpg"
          aria-hidden="true"
        >
          <source src="/hero/look.mp4" type="video/mp4" />
        </video>
        )}
        <div className="section-eyebrow" dir="ltr">NEW LOOK · SAME YOU</div>
        {loggedIn ? (
          <>
            <h2>{subscribed ? 'מוכנה לבחור תכשיטים?' : 'נשאר רק לבחור מסלול'}</h2>
            <p>
              {subscribed
                ? 'הקטלוג מחכה. אפשר להוסיף לקופסה ולהמשיך מהאזור האישי.'
                : 'החשבון כבר פתוח. בחרי מסלול כדי להתחיל לבחור תכשיטים.'}
            </p>
            <Link to={memberHref} className="btn">
              {subscribed ? 'לקטלוג התכשיטים' : 'לבחירת מסלול'}
            </Link>
          </>
        ) : (
          <>
            <h2>בואי להתחדש</h2>
            <p>ההרשמה לוקחת כמה דקות, והתכשיטים הראשונים כבר בדרך אלייך.</p>
            <Link to="/signup" className="btn">
              הצטרפי עכשיו
            </Link>
          </>
        )}
      </section>
    </div>
  );
}
