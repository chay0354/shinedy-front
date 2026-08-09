import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useApp } from '../../state/AppContext';
import { applySessionFromResponse } from '../../lib/auth';
import Button from '../../components/Button';
import { homePathForRole } from '../../lib/roles';
import { JewelArt } from '../../components/icons';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { run, error } = useApp();
  const navigate = useNavigate();

  async function enter() {
    if (!email.trim() || !password) {
      setFormError('נא למלא דוא״ל וסיסמה');
      return;
    }
    setFormError('');
    const data = await run(() => api.login({ email: email.trim(), password }));
    if (!data) return;
    applySessionFromResponse(data);
    navigate(homePathForRole(data.auth?.role, data.subscribed));
  }

  const message = formError || error;

  return (
    <div className="auth-page">
      <div className="auth-split">
        <div className="auth-form">
          <h1 className="auth-title">התחברות</h1>
          <p className="auth-sub">ברוכה הבאה חזרה</p>

          {message ? <div className="auth-error">{message}</div> : null}

          <label className="form-field">
            <span>דוא״ל</span>
            <input
              className="input"
              type="email"
              placeholder="name@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="form-field">
            <span>סיסמה</span>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && enter()}
            />
          </label>

          <Button
            type="button"
            className="btn-ink btn-block"
            loadingText="נכנסת…"
            onClick={enter}
          >
            התחברות
          </Button>

          <p className="auth-alt">
            אין לך חשבון?{' '}
            <button type="button" className="btn-link" onClick={() => navigate('/signup')}>
              להרשמה
            </button>
          </p>
        </div>

        <div className="auth-visual" aria-hidden="true">
          <JewelArt variant="necklace" />
        </div>
      </div>
    </div>
  );
}
