import { useNavigate } from 'react-router-dom';
import { useApp } from '../../state/AppContext';
import StoreHome from '../../components/StoreHome';
import Button from '../../components/Button';

function LandingHero({ subscribed }) {
  const navigate = useNavigate();

  return (
    <section className="home-landing">
      <div className="home-atmosphere" aria-hidden="true">
        <div className="home-mesh" />
        <div className="home-orb home-orb-a" />
        <div className="home-orb home-orb-b" />
        <div className="home-orb home-orb-c" />
        <div className="home-sheen" />
        <div className="home-spark home-spark-1" />
        <div className="home-spark home-spark-2" />
        <div className="home-spark home-spark-3" />
        <svg className="home-ring home-ring-1" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="78" stroke="currentColor" strokeWidth="0.6" />
          <circle cx="100" cy="100" r="58" stroke="currentColor" strokeWidth="0.4" opacity="0.5" />
        </svg>
        <svg className="home-ring home-ring-2" viewBox="0 0 200 200" fill="none">
          <ellipse cx="100" cy="100" rx="70" ry="40" stroke="currentColor" strokeWidth="0.5" />
        </svg>
        <svg className="home-jewel" viewBox="0 0 80 80" fill="none">
          <path
            d="M40 12 L58 28 L40 68 L22 28 Z"
            stroke="currentColor"
            strokeWidth="1.2"
            opacity="0.35"
          />
          <path d="M22 28 H58" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
        </svg>
      </div>

      <div className="home-landing-inner">
        <p className="home-brand">SHINEDY</p>
        <h1 className="home-headline">
          תכשיטים במנוי.
          <br />
          לובשים, מחליפים, נהנים.
        </h1>
        <p className="home-sub">
          מסלול חודשי, נקודות לבחירה, והחלפה בכל רגע — חוויית תכשיטים בלי התחייבות לרכישה.
        </p>
        <div className="home-cta">
          {subscribed ? (
            <>
              <Button
                type="button"
                className="btn btn-primary home-btn"
                onClick={() => navigate('/account/shop')}
              >
                לחנות שלי
              </Button>
              <Button
                type="button"
                className="btn home-btn-ghost"
                onClick={() =>
                  document.getElementById('home-collection')?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                לקולקציה
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                className="btn btn-primary home-btn"
                onClick={() => navigate('/plans')}
              >
                לצפייה במסלולים
              </Button>
              <Button
                type="button"
                className="btn home-btn-ghost"
                onClick={() =>
                  document.getElementById('home-collection')?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                לקולקציה
              </Button>
            </>
          )}
        </div>
      </div>

      <button
        type="button"
        className="home-scroll"
        aria-label="גללי לקולקציה"
        onClick={() =>
          document.getElementById('home-collection')?.scrollIntoView({ behavior: 'smooth' })
        }
      >
        <span />
      </button>
    </section>
  );
}

export default function HomePage() {
  const { state } = useApp();
  const subscribed = Boolean(state?.subscribed);

  return (
    <div className="home-page">
      <LandingHero subscribed={subscribed} />
      <div id="home-collection" className="home-collection main-pane-store">
        <StoreHome guest={!subscribed} hideHero />
      </div>
    </div>
  );
}
