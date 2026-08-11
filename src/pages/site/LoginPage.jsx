import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useApp } from '../../state/AppContext';
import { applySessionFromResponse } from '../../lib/auth';
import { homePathForRole } from '../../lib/roles';

export default function LoginPage() {
  const [error, setError] = useState('');
  const { run } = useApp();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const f = e.target;
    const email = f.elements['l-email'].value.trim();
    const password = f.elements['l-pass'].value;
    setError('');
    const data = await run(() => api.login({ email, password }));
    if (!data) {
      setError('פרטי התחברות שגויים');
      return;
    }
    applySessionFromResponse(data);
    navigate(homePathForRole(data.auth?.role, data.subscribed, data.planId));
  }

  return (
    <div className="auth-split">
      <div className="auth-form-side">
        <div className="form-card">
          <h1>התחברות</h1>
          <p className="sub">ברוכה השבה</p>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="l-email">אימייל</label>
              <input id="l-email" name="l-email" type="email" required placeholder="name@email.com" dir="ltr" />
            </div>
            <div className="field">
              <label htmlFor="l-pass">סיסמה</label>
              <input id="l-pass" name="l-pass" type="password" required placeholder="••••••••" dir="ltr" />
            </div>
            {error && <p className="form-err">{error}</p>}
            <button type="submit" className="btn btn-wide">
              התחברות
            </button>
          </form>
          <p className="form-note">
            אין לך חשבון?{' '}
            <Link to="/signup" className="link-gold">
              הירשמי כאן
            </Link>
          </p>
        </div>
      </div>
      <div
        className="auth-photo"
        style={{ backgroundImage: 'url(/photos/bag.jpg)' }}
        role="img"
        aria-label="שקית מתנה של Shinedy"
      />
    </div>
  );
}
