import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useApp } from '../../state/AppContext';
import { applySessionFromResponse } from '../../lib/auth';

export default function LoginPage() {
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { run } = useApp();
  const navigate = useNavigate();

  async function enter() {
    if (!email.trim() || !password) {
      setFormError('נא למלא דוא״ל וסיסמה');
      return;
    }
    setFormError('');
    const data = await run(() => api.login({ email: email.trim(), password }));
    applySessionFromResponse(data);
    navigate('/account/shop');
  }

  return (
    <div className="page" style={{ display: 'flex', justifyContent: 'center' }}>
      <div className="auth-box">
        <div className="tabs">
          <button
            type="button"
            className={tab === 'login' ? 'active' : ''}
            onClick={() => setTab('login')}
          >
            התחברות
          </button>
          <button
            type="button"
            className={tab === 'signup' ? 'active' : ''}
            onClick={() => navigate('/signup')}
          >
            הרשמה
          </button>
        </div>

        {tab === 'login' ? (
          <div>
            {formError ? (
              <div className="error-banner" style={{ marginBottom: 12 }}>
                {formError}
              </div>
            ) : null}
            <input
              className="field"
              placeholder="דוא״ל"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="field"
              placeholder="סיסמה"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', padding: 14 }}
              onClick={enter}
            >
              כניסה
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
