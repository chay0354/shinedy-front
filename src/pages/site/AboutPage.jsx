import { IconDiamond, IconInfinity, IconUser } from '../../components/icons';
import PageHead from '../../components/PageHead';

export default function AboutPage() {
  return (
    <>
    <PageHead eyebrow="ABOUT" title="אודות Shinedy" />
    <section className="section" style={{ paddingTop: 48 }}>
      <div className="container">
        <div className="about-split">
          <div className="photo">
            <img src="/photos/pearls.jpg" alt="שרשרת פנינים עם סמל Shinedy" />
          </div>
          <div>
            <div className="prose">
              <p>
                <strong>Shinedy נולדה מתוך אהבה לעולם התכשיטים</strong> — ומתוך רעיון פשוט: למה לקנות תכשיט אחד,
                כשאפשר לענוד תכשיטים חדשים כל הזמן?
              </p>
              <p>
                אנחנו מאמינות שכל אישה ראויה לגוון, לרענן ולהתאים את התכשיטים שלה לכל רגע — בלי להתחייב לרכישה
                יקרה. המנוי שלנו מאפשר לך ליהנות מתכשיטים איכותיים — זהב, כסף, יהלומי מעבדה ומואסניט — עם שירות
                אישי ומשלוח עד הבית.
              </p>
              <p>
                כל תכשיט עובר ניקוי, חיטוי ובקרת איכות קפדנית לפני שהוא מגיע אלייך, ארוז ומושלם. התאהבת? הקרדיטים
                שצברת יעזרו לך להפוך אותו לשלך.
              </p>
              <p>
                <strong>NEW LOOK. SAME YOU.</strong>
              </p>
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
        </div>
      </div>
    </section>
    </>
  );
}
