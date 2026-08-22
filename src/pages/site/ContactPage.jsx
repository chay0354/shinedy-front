import { useState } from 'react';
import { api } from '../../api';
import { SERVICE_EMAIL, SERVICE_PHONE, SERVICE_PHONE_TEL } from '../../lib/contact';
import { IconClock, IconMail, IconPhone } from '../../components/icons';

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.contact(form);
      setSent(true);
    } catch (err) {
      setError(err.message || 'השליחה נכשלה. נסי שוב או כתבי ישירות למייל.');
    } finally {
      setBusy(false);
    }
  }

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
                    הפנייה נשלחה אל {SERVICE_EMAIL} ונחזור אלייך בהקדם.
                  </p>
                </div>
              ) : (
                <form onSubmit={onSubmit}>
                  <div className="field">
                    <label htmlFor="c-name">שם מלא</label>
                    <input
                      id="c-name"
                      required
                      placeholder="השם שלך"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="c-email">אימייל</label>
                    <input
                      id="c-email"
                      type="email"
                      required
                      placeholder="you@email.com"
                      dir="ltr"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="c-subject">נושא</label>
                    <input
                      id="c-subject"
                      placeholder="על מה תרצי לדבר?"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="c-msg">הודעה</label>
                    <textarea
                      id="c-msg"
                      rows="4"
                      required
                      placeholder="כתבי לנו כאן..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                    />
                  </div>
                  {error && <p className="form-err">{error}</p>}
                  <button type="submit" className="btn btn-wide" disabled={busy}>
                    {busy ? 'שולחת…' : 'שליחה'}
                  </button>
                </form>
              )}
            </div>

            <div className="contact-card">
              <h3>פרטי יצירת קשר</h3>
              <div className="contact-row">
                <IconPhone size={22} />
                <a href={`tel:${SERVICE_PHONE_TEL}`} dir="ltr">
                  {SERVICE_PHONE}
                </a>
              </div>
              <div className="contact-row">
                <IconMail size={22} />
                <a href={`mailto:${SERVICE_EMAIL}`} dir="ltr">
                  {SERVICE_EMAIL}
                </a>
              </div>
              <div className="contact-row">
                <IconClock size={22} />
                <span>ימים א׳–ה׳ · 10:00–18:00</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
