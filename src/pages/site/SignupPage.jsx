import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useApp } from '../../state/AppContext';
import Button from '../../components/Button';
import { homePathForRole } from '../../lib/roles';
import { JewelArt } from '../../components/icons';

export default function SignupPage() {
  const { run, error } = useApp();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    passwordConfirm: '',
    terms: false,
  });

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit() {
    if (submitting) return;
    setSubmitting(true);
    try {
      const data = await run(async () => {
        if (!form.fullName.trim() || !form.email.trim() || !form.password) {
          throw new Error('יש למלא שם, דוא״ל וסיסמה');
        }
        if (form.password !== form.passwordConfirm) {
          throw new Error('הסיסמאות אינן תואמות');
        }
        if (!form.terms) {
          throw new Error('יש לאשר את תנאי השימוש');
        }
        return api.register({
          email: form.email.trim(),
          password: form.password,
          fullName: form.fullName.trim(),
        });
      });
      if (!data) return;
      navigate(homePathForRole(data.auth?.role, data.subscribed, data.planId));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-split">
        <div className="auth-visual" aria-hidden="true">
          <JewelArt variant="bracelet" />
        </div>

        <div className="auth-form">
          <h1 className="auth-title">יצירת חשבון</h1>
          <p className="auth-sub">הצטרפי לעולם של תכשיטים יוקרתיים</p>

          {error ? <div className="auth-error">{error}</div> : null}

          <label className="form-field">
            <span>שם מלא</span>
            <input
              className="input"
              placeholder="השם שלך"
              value={form.fullName}
              disabled={submitting}
              onChange={(e) => set('fullName', e.target.value)}
            />
          </label>

          <label className="form-field">
            <span>דוא״ל</span>
            <input
              className="input"
              type="email"
              placeholder="name@email.com"
              value={form.email}
              disabled={submitting}
              onChange={(e) => set('email', e.target.value)}
            />
          </label>

          <label className="form-field">
            <span>טלפון</span>
            <input
              className="input"
              placeholder="050-0000000"
              value={form.phone}
              disabled={submitting}
              onChange={(e) => set('phone', e.target.value)}
            />
          </label>

          <label className="form-field">
            <span>סיסמה</span>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              disabled={submitting}
              onChange={(e) => set('password', e.target.value)}
            />
          </label>

          <label className="form-field">
            <span>אימות סיסמה</span>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={form.passwordConfirm}
              disabled={submitting}
              onChange={(e) => set('passwordConfirm', e.target.value)}
            />
          </label>

          <label className="form-check">
            <input
              type="checkbox"
              checked={form.terms}
              disabled={submitting}
              onChange={(e) => set('terms', e.target.checked)}
            />
            אני מאשרת את תנאי השימוש ומדיניות הפרטיות
          </label>

          <Button
            type="button"
            className="btn-ink btn-block"
            loading={submitting}
            loadingText="נרשמת…"
            disabled={submitting}
            onClick={submit}
          >
            הרשמה
          </Button>

          <p className="auth-alt">
            כבר יש לך חשבון?{' '}
            <button type="button" className="btn-link" onClick={() => navigate('/login')}>
              להתחברות
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
