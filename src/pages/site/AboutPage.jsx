import { Link } from 'react-router-dom';
import { IconDiamond, IconInfinity, IconUser } from '../../components/icons';
import PageHead from '../../components/PageHead';
import HeroArt from '../../components/HeroArt';

export default function AboutPage() {
  return (
    <>
    <PageHead className="about-head" eyebrow="ABOUT" title="אודות Shinedy" />
    <section className="section about-page" style={{ paddingTop: 12 }}>
      <div className="container">
        <div className="about-hero-art">
          <HeroArt />
        </div>
        <div className="prose about-prose">
              <p>
                <strong>Shinedy נולדה מתוך אהבה לעולם התכשיטים</strong>, ומתוך רעיון פשוט: למה לקנות תכשיט אחד,
                כשאפשר לענוד תכשיטים חדשים כל הזמן?
              </p>
              <p>
                אנחנו מאמינות שכל אישה ראויה לגוון, לרענן ולהתאים את התכשיטים שלה לכל רגע, בלי להתחייב לרכישה
                יקרה. המנוי שלנו מאפשר לך ליהנות מתכשיטים איכותיים: <strong>זהב, כסף, יהלומי מעבדה ומואסניט</strong>, עם שירות
                אישי ומשלוח עד הבית.
              </p>
              <p>
                כל תכשיט עובר ניקוי, חיטוי ובקרת איכות קפדנית לפני שהוא מגיע אלייך, ארוז ומושלם. התאהבת? <strong>הקרדיטים
                שצברת יעזרו לך להפוך אותו לשלך.</strong>
              </p>
              <p>
                <strong>NEW LOOK · SAME YOU</strong>
              </p>
        </div>
        <div className="about-actions">
          <Link to="/catalog" className="btn about-cta">לקטלוג</Link>
        </div>
        <div className="about-icons">
              <div className="it">
                <IconDiamond size={30} />
                <span>תכשיטים יוקרתיים</span>
              </div>
              <div className="it">
                <IconUser size={30} />
                <span>שירות אישי</span>
              </div>
              <div className="it">
                <IconInfinity size={30} />
                <span>אינסוף אפשרויות</span>
              </div>
        </div>
      </div>
    </section>
    </>
  );
}
