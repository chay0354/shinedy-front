import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useApp } from '../../state/AppContext';
import { applySessionFromResponse, getToken } from '../../lib/auth';
import { homePathForRole } from '../../lib/roles';
import { IconEye, IconEyeOff } from '../../components/icons';
import HeroArt from '../../components/HeroArt';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const { state, run } = useApp();
  const navigate = useNavigate();

  if (getToken() && state?.auth?.userId) {
    return <Navigate to={homePathForRole(state.auth.role)} replace />;
  }

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
    navigate(homePathForRole(data.auth?.role));
  }

  return (
    <div className="auth-split">
      <div className="auth-form-side">
        <div className="form-card">
          <h1>התחברות</h1>
          <p className="sub">ברוכה השבה</p>
          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="l-email">אימייל</label>
              <input
                id="l-email"
                name="l-email"
                type="email"
                autoComplete="username"
                inputMode="email"
                required
                placeholder="name@email.com"
                dir="ltr"
              />
            </div>
            <div className="field">
              <label htmlFor="l-pass">סיסמה</label>
              <div className="pass-wrap">
                <input
                  id="l-pass"
                  name="l-pass"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  dir="ltr"
                />
                <button
                  type="button"
                  className="pass-toggle"
                  aria-label={showPass ? 'הסתרת סיסמה' : 'הצגת סיסמה'}
                  title={showPass ? 'הסתרת סיסמה' : 'הצגת סיסמה'}
                  onClick={() => setShowPass((v) => !v)}
                >
                  {showPass ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                </button>
              </div>
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
      <div className="auth-photo">
        <HeroArt />
      </div>
    </div>
  );
}
