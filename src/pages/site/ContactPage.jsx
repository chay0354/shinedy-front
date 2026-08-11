import { useState } from 'react';
import { IconClock, IconMail, IconPhone } from '../../components/icons';

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <>
      <div className="page-head container">
        <h1>יצירת קשר</h1>
        <p>אנחנו כאן לעזור</p>
      </div>

      <section className="section" style={{ paddingTop: 44 }}>
        <div className="container">
          <div className="contact-grid">
            <div className="contact-card">
              <h3>שלחי לנו הודעה</h3>
              {sent ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <h3 style={{ color: 'var(--gold-dark)' }}>תודה!</h3>
                  <p style={{ color: 'var(--muted)', marginTop: 8, fontWeight: 300 }}>
                    הפנייה התקבלה ונחזור אלייך בהקדם.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSent(true);
                  }}
                >
                  <div className="field">
                    <label htmlFor="c-name">שם מלא</label>
                    <input id="c-name" required placeholder="השם שלך" />
                  </div>
                  <div className="field">
                    <label htmlFor="c-email">אימייל</label>
                    <input id="c-email" type="email" required placeholder="you@email.com" dir="ltr" />
                  </div>
                  <div className="field">
                    <label htmlFor="c-subject">נושא</label>
                    <input id="c-subject" placeholder="על מה תרצי לדבר?" />
                  </div>
                  <div className="field">
                    <label htmlFor="c-msg">הודעה</label>
                    <textarea id="c-msg" rows="4" placeholder="כתבי לנו כאן..." />
                  </div>
                  <button type="submit" className="btn btn-wide">
                    שליחה
                  </button>
                  <p className="form-note">הטופס בשלב זה להדגמה — טרם מחובר למערכת פניות.</p>
                </form>
              )}
            </div>

            <div className="contact-card">
              <h3>פרטי יצירת קשר</h3>
              <div className="contact-row">
                <IconPhone size={22} />
                <a href="tel:03-1234567" dir="ltr">
                  03-1234567
                </a>
              </div>
              <div className="contact-row">
                <IconMail size={22} />
                <a href="mailto:hello@shinedy.com" dir="ltr">
                  hello@shinedy.com
                </a>
              </div>
              <div className="contact-row">
                <IconClock size={22} />
                <span>ימים א׳–ה׳ · 10:00–18:00</span>
              </div>
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem', fontWeight: 300, marginTop: 18 }}>
                (פרטי הקשר זמניים — יעודכנו לפרטים האמיתיים של העסק)
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
