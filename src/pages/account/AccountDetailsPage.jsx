import { Link, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { api } from '../../api';
import { useApp } from '../../state/AppContext';
import { getToken } from '../../lib/auth';
import { goToCheckout } from '../../lib/checkout';
import { isIsraeliMobile, toLocalIl } from '../../lib/phone';

export default function AccountDetailsPage() {
  const { state, run, refresh } = useApp();
  const addr = state?.registration?.address || state?.address || {};
  const [form, setForm] = useState({
    phone: state?.registration?.phone || '',
    street: addr.street || '',
    houseNo: addr.houseNo || '',
    apt: addr.apt || '',
    city: addr.city || '',
    zip: addr.zip || '',
  });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [cardBusy, setCardBusy] = useState(false);

  if (!getToken()) return <Navigate to="/login" replace />;

  const payment = state?.payment;

  async function replaceCard() {
    setCardBusy(true);
    try {
      await goToCheckout({ kind: 'card' }, run);
    } finally {
      setCardBusy(false);
    }
  }

  async function save(e) {
    e.preventDefault();
    setErr('');
    setMsg('');
    if (!isIsraeliMobile(form.phone)) {
      setErr('יש למלא מספר נייד תקין');
      return;
    }
    if (!form.street.trim() || !form.houseNo.trim() || !form.city.trim()) {
      setErr('יש למלא כתובת מלאה למשלוח');
      return;
    }
    const address = {
      street: form.street.trim(),
      houseNo: form.houseNo.trim(),
      apt: form.apt.trim(),
      city: form.city.trim(),
      zip: form.zip.trim(),
    };
    const data = await run(() =>
      api.updateRegistration({ phone: toLocalIl(form.phone), address }),
    );
    if (data) {
      setMsg('הפרטים עודכנו ✓');
      await refresh();
    }
  }

  return (
    <section className="container account-body" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <Link to="/account/me" className="back-link">← חזרה לאזור האישי</Link>
      <h1 className="account-h2" style={{ marginTop: 8 }}>עדכון פרטים</h1>
      <p className="account-tip">כתובת וטלפון לעדכון משלוחים והתקשרות.</p>
      {err && <p className="form-err">{err}</p>}
      {msg && <p className="msg-ok">{msg}</p>}
      <form className="signup-card" style={{ maxWidth: 520, marginTop: 20 }} onSubmit={save} noValidate>
        <div className="field">
          <label htmlFor="d-phone">טלפון נייד</label>
          <input
            id="d-phone"
            type="tel"
            dir="ltr"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
        </div>
        <p className="signup-pay-note">כתובת למשלוח</p>
        <div className="field">
          <label htmlFor="d-street">רחוב</label>
          <input
            id="d-street"
            value={form.street}
            onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))}
          />
        </div>
        <div className="field">
          <label htmlFor="d-house">מספר בית</label>
          <input
            id="d-house"
            value={form.houseNo}
            onChange={(e) => setForm((f) => ({ ...f, houseNo: e.target.value }))}
          />
        </div>
        <div className="field">
          <label htmlFor="d-apt">דירה</label>
          <input id="d-apt" value={form.apt} onChange={(e) => setForm((f) => ({ ...f, apt: e.target.value }))} />
        </div>
        <div className="field">
          <label htmlFor="d-city">עיר</label>
          <input id="d-city" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
        </div>
        <div className="field">
          <label htmlFor="d-zip">מיקוד</label>
          <input
            id="d-zip"
            dir="ltr"
            value={form.zip}
            onChange={(e) => setForm((f) => ({ ...f, zip: e.target.value }))}
          />
        </div>
        <button type="submit" className="btn btn-wide">שמירת פרטים</button>
      </form>

      <h2 className="account-h2" style={{ marginTop: 36 }}>אמצעי תשלום</h2>
      <p className="account-tip">
        {payment?.onFile
          ? `כרטיס שמור לחיובים: •••• ${payment.last4}${payment.expiry ? ` · תוקף ${payment.expiry}` : ''}`
          : payment?.last4
            ? `הכרטיס •••• ${payment.last4} אינו פעיל לחיובים. יש לשמור כרטיס כדי שהמנוי והמשלוחים ייגבו.`
            : 'אין כרטיס שמור לחיובים.'}
      </p>
      {state?.billingIssue && (
        <p className="form-err">חיוב אחרון בכרטיס נכשל. אחרי שמירת כרטיס חדש ננסה לחייב שוב.</p>
      )}
      <p className="cell-sub">
        פרטי הכרטיס מוזנים בדף מאובטח של Hyp. בשמירת כרטיס מתבצעת בדיקת תקינות בלבד, ללא חיוב.
      </p>
      <button type="button" className="btn" style={{ marginTop: 12 }} disabled={cardBusy} onClick={replaceCard}>
        {cardBusy ? 'מעביר…' : payment?.onFile ? 'החלפת כרטיס' : 'שמירת כרטיס'}
      </button>
    </section>
  );
}
