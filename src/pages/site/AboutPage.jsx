import { Link } from 'react-router-dom';
import { IconDiamond, IconInfinity, IconUser } from '../../components/icons';
import BrandMark from '../../components/BrandMark';

export default function AboutPage() {
  return (
    <section className="section about-page">
      <div className="container">
        <BrandMark />
        <div className="prose about-prose">
          <p>
            Shinedy נולדה מתוך אהבה לעולם התכשיטים, ומתוך רעיון פשוט:
            <br />
            <strong>למה לקנות תכשיט אחד, כשאפשר לענוד תכשיטים חדשים כל הזמן?</strong>
          </p>
          <p>
            אנחנו מאמינות שכל אישה ראויה לגוון, לרענן ולהתאים את התכשיטים שלה
            <br />
            לכל רגע, בלי להתחייב לרכישה יקרה.
          </p>
          <p>
            המנוי שלנו מאפשר לך ליהנות מתכשיטים איכותיים: זהב, כסף, יהלומי
            <br />
            מעבדה ומואסניט, עם שירות אישי ומשלוח עד הבית.
          </p>
          <p>
            כל תכשיט עובר ניקוי, חיטוי ובקרת איכות קפדנית לפני שהוא מגיע אלייך,
            <br />
            ארוז ומושלם. התאהבת? הקרדיטים שצברת יעזרו לך להפוך אותו לשלך.
          </p>
          <p className="about-sign">
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
  );
}
