import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useApp } from '../../state/AppContext';
import Button from '../../components/Button';
import { homePathForRole } from '../../lib/roles';

export default function SignupPage() {
  const { run, error } = useApp();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });

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
        return api.register({
          email: form.email.trim(),
          password: form.password,
          fullName: form.fullName.trim(),
        });
      });
      if (!data) return;
      navigate(homePathForRole(data.auth?.role, data.subscribed));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page" style={{ display: 'flex', justifyContent: 'center' }}>
      <div className="auth-box">
        <div className="display" style={{ fontSize: 22, marginBottom: 20 }}>
          הרשמה ל-Shinedy
        </div>

        {error && (
          <div className="muted" style={{ fontSize: 13, marginBottom: 12, color: 'var(--accent)' }}>
            {error}
          </div>
        )}

        <input
          className="field"
          placeholder="שם מלא"
          value={form.fullName}
          disabled={submitting}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
        />
        <input
          className="field"
          placeholder="דוא״ל"
          type="email"
          value={form.email}
          disabled={submitting}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          className="field"
          placeholder="סיסמה"
          type="password"
          value={form.password}
          disabled={submitting}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <input
          className="field"
          placeholder="אימות סיסמה"
          type="password"
          value={form.passwordConfirm}
          disabled={submitting}
          onChange={(e) => setForm({ ...form, passwordConfirm: e.target.value })}
        />

        <Button
          type="button"
          className="btn btn-primary"
          style={{ width: '100%', padding: 14, marginTop: 8 }}
          loading={submitting}
          loadingText="נרשמת…"
          disabled={submitting}
          onClick={submit}
        >
          הרשמה
        </Button>

        <button
          type="button"
          className="accent"
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: 13,
            marginTop: 16,
            width: '100%',
          }}
          disabled={submitting}
          onClick={() => navigate('/login')}
        >
          כבר יש לך חשבון? התחברי
        </button>
      </div>
    </div>
  );
}
