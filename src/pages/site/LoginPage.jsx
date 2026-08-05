import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useApp } from '../../state/AppContext';
import { applySessionFromResponse } from '../../lib/auth';

const USE_DB = import.meta.env.VITE_USE_DATABASE === 'true';

export default function LoginPage() {
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('demo@shinedy.co.il');
  const [password, setPassword] = useState('demo');
  const { run } = useApp();
  const navigate = useNavigate();

  async function enter() {
    const data = await run(() =>
      api.login(USE_DB ? { email, password } : undefined),
    );
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
