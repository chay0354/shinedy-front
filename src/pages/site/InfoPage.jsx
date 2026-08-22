import { useState } from 'react';
import ImageSlot from '../../components/ImageSlot';
import Button from '../../components/Button';
import {
  IconChevron,
  IconDiamond,
  IconFacebook,
  IconHeart,
  IconInstagram,
  IconMail,
  IconPhone,
  IconPin,
  IconRefresh,
  IconUser,
} from '../../components/icons';

const FAQS = [
  {
    q: 'איך המנוי עובד?',
    a: 'בוחרים מסלול חודשי שמעניק מכסת נקודות. לכל תכשיט ערך בנקודות, ואפשר לבחור תכשיטים עד למכסה של המסלול.',
  },
  {
    q: 'כמה פעמים אפשר להחליף תכשיטים?',
    a: 'בהתאם למסלול שבחרת — כל מסלול כולל מספר החלפות חודשי. ההחזרה והמשלוח החוזר הם על חשבוננו.',
  },
  {
    q: 'האם יש התחייבות? אפשר לבטל מתי שרוצים?',
    a: 'אין התחייבות. אפשר לבטל את המנוי בכל עת מהאזור האישי, וההחזרה מתבצעת עם נרתיק ייעודי.',
  },
  {
    q: 'מה קורה אם התכשיט נפגם?',
    a: 'התכשיט חוזר לבדיקה במחסן שלנו לתיקון או ניקוי, ואת מקבלת תכשיט חלופי ללא עלות נוספת.',
  },
  {
    q: 'איך מנקים את התכשיטים?',
    a: 'כל תכשיט עובר ניקוי מקצועי ובקרת איכות לפני שהוא נשלח ללקוחה הבאה.',
  },
];

const ABOUT_PERKS = [
  { icon: <IconDiamond />, label: 'קולקציה של תכשיטים איכותיים' },
  { icon: <IconUser />, label: 'שירות אישי וליווי צמוד' },
  { icon: <IconRefresh />, label: 'גמישות מלאה בהחלפות' },
];

export default function InfoPage() {
  const [open, setOpen] = useState(0);

  return (
    <>
      <section className="site-section">
        <div className="shell" style={{ maxWidth: 760 }}>
          <div className="section-head">
            <h2 className="section-title">שאלות נפוצות</h2>
          </div>

          <div className="faq-list">
            {FAQS.map((f, i) => (
              <div key={f.q} className={`faq-item${open === i ? ' open' : ''}`}>
                <button
                  type="button"
                  className="faq-q"
                  aria-expanded={open === i}
                  onClick={() => setOpen(open === i ? -1 : i)}
                >
                  {f.q}
                  <IconChevron />
                </button>
                {open === i ? <div className="faq-a">{f.a}</div> : null}
              </div>
            ))}
          </div>

          <div className="faq-cta">
            <p>לא מצאת תשובה?</p>
            <span>נשמח לעזור — צוות Shinedy כאן בשבילך</span>
            <Button
              type="button"
              className="btn-gold"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              צרי קשר
            </Button>
          </div>
        </div>
      </section>

      <section className="site-section site-section-alt">
        <div className="shell">
          <div className="about-split">
            <div className="about-media">
              <ImageSlot label="Shinedy" category="שרשראות" />
            </div>
            <div className="about-text">
              <h2 className="section-title" style={{ textAlign: 'start', marginBottom: 16 }}>
                אודות
              </h2>
              <p>
                Shinedy נולדה מתוך אהבה לעולם התכשיטים ומתוך מחשבה שאפשר ליהנות מתכשיט יוקרתי
                חדש בכל חודש — בלי להתחייב לרכישה.
              </p>
              <p>
                אנחנו מאמינות שכל אישה ראויה לזהור. לכן בנינו מודל מנוי גמיש שמאפשר לבחור,
                לענוד ולהחליף תכשיטים איכותיים, עם משלוח והחזרה ללא עלות ושירות אישי לאורך כל
                הדרך.
              </p>
              <div className="about-perks">
                {ABOUT_PERKS.map((perk) => (
                  <div key={perk.label}>
                    {perk.icon}
                    <span>{perk.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="site-section" id="contact">
        <div className="shell">
          <div className="section-head">
            <h2 className="section-title">צור קשר</h2>
            <p className="section-sub">אנחנו כאן לעזור</p>
          </div>

          <div className="contact-split">
            <div className="contact-card">
              <h3>שלחי לנו הודעה</h3>
              <label className="form-field">
                <span>שם מלא</span>
                <input className="input" placeholder="השם שלך" />
              </label>
              <label className="form-field">
                <span>דוא״ל</span>
                <input className="input" type="email" placeholder="name@email.com" />
              </label>
              <label className="form-field">
                <span>טלפון</span>
                <input className="input" placeholder="050-0000000" />
              </label>
              <label className="form-field">
                <span>הודעה</span>
                <textarea className="input" placeholder="במה נוכל לעזור?" />
              </label>
              <Button type="button" className="btn-ink btn-block">
                שליחה
              </Button>
            </div>

            <div className="contact-card">
              <h3>פרטי יצירת קשר</h3>
              <ul className="contact-lines">
                <li>
                  <IconPhone />
                  050-9372937
                </li>
                <li>
                  <IconMail />
                  service@shinedy.co
                </li>
                <li>
                  <IconPin />
                  רחוב התכשיטים 1, תל אביב
                </li>
              </ul>
              <div className="contact-socials">
                <button type="button" aria-label="Instagram">
                  <IconInstagram />
                </button>
                <button type="button" aria-label="Facebook">
                  <IconFacebook />
                </button>
                <button type="button" aria-label="מועדפים">
                  <IconHeart />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
