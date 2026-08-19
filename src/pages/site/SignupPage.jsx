import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../api';
import { useApp } from '../../state/AppContext';
import { applySessionFromResponse } from '../../lib/auth';
import { enrichPlan } from '../../lib/plans';

export default function SignupPage() {
  const { state, run } = useApp();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [params] = useSearchParams();
  const fromUrl = params.get('plan');
  const plans = (state?.plans || []).map(enrichPlan);
  const defaultPlan = plans.some((p) => p.id === fromUrl) ? fromUrl : plans.find((p) => p.featured)?.id || plans[0]?.id;

  async function handleSubmit(e) {
    e.preventDefault();
    const f = e.target;
    if (f.elements['s-pass'].value !== f.elements['s-pass2'].value) {
      setError('הסיסמאות אינן תואמות — נסי שוב');
      return;
    }
    setError('');
    const planId = f.elements['s-plan'].value;
    const data = await run(() =>
      api.register({
        fullName: f.elements['s-name'].value.trim(),
        email: f.elements['s-email'].value.trim(),
        password: f.elements['s-pass'].value,
        phone: f.elements['s-phone'].value.trim(),
      }),
    );
    if (!data) {
      setError('לא ניתן להירשם — בדקי את הפרטים');
      return;
    }
    applySessionFromResponse(data);
    if (planId) {
      const sub = await run(() => api.subscribe(planId));
      if (sub) applySessionFromResponse(sub);
    }
    navigate('/catalog');
  }

  return (
    <div className="auth-split">
      <div className="auth-photo" style={{ backgroundImage: 'url(/photos/bag.jpg)' }} role="img" aria-label="שקית מתנה של Shinedy" />
      <div className="auth-form-side">
        <div className="form-card">
          <h1>יצירת חשבון</h1>
          <p className="sub">הצטרפי לעולם של תכשיטים יוקרתיים</p>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="s-name">שם מלא</label>
              <input id="s-name" name="s-name" required placeholder="השם שלך" />
            </div>
            <div className="field">
              <label htmlFor="s-phone">טלפון נייד</label>
              <input id="s-phone" name="s-phone" type="tel" required placeholder="050-0000000" dir="ltr" />
            </div>
            <div className="field">
              <label htmlFor="s-email">אימייל</label>
              <input id="s-email" name="s-email" type="email" required placeholder="name@email.com" dir="ltr" />
            </div>
            <div className="field">
              <label htmlFor="s-pass">סיסמה</label>
              <input id="s-pass" name="s-pass" type="password" required minLength={8} placeholder="לפחות 8 תווים" dir="ltr" />
            </div>
            <div className="field">
              <label htmlFor="s-pass2">אימות סיסמה</label>
              <input id="s-pass2" name="s-pass2" type="password" required minLength={8} placeholder="••••••••" dir="ltr" />
            </div>
            <div className="field">
              <label htmlFor="s-plan">המסלול שלי</label>
              <select id="s-plan" name="s-plan" defaultValue={defaultPlan}>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.latin} · {p.name} — ₪{p.price} לחודש
                  </option>
                ))}
              </select>
            </div>
            <label className="check-row">
              <input type="checkbox" required />
              <span>אני מסכימה לתקנון ולמדיניות הפרטיות</span>
            </label>
            {error && <p className="form-err">{error}</p>}
            <button type="submit" className="btn btn-wide">
              הרשמה
            </button>
          </form>
          <p className="form-note">
            כבר יש לך חשבון?{' '}
            <Link to="/login" className="link-gold">
              התחברי כאן
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
