import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { getToken } from '../../lib/auth';
import { useApp } from '../../state/AppContext';
import Button from '../../components/Button';

export default function PlansPage() {
  const { state, run } = useApp();
  const navigate = useNavigate();

  async function subscribe(planId) {
    if (!getToken()) {
      navigate('/login');
      return;
    }
    try {
      await run(() => api.subscribe(planId));
      navigate('/account/shop');
    } catch {
      /* error shown via AppContext */
    }
  }

  return (
    <div className="page">
      <div className="display" style={{ fontSize: 34, marginBottom: 8, textAlign: 'center' }}>
        מסלולי מנוי
      </div>
      <div className="muted" style={{ textAlign: 'center', marginBottom: 40 }}>
        בחרי את המסלול שמתאים לך
      </div>
      <div className="plan-grid">
        {(state?.plans || []).map((pl) => (
          <div key={pl.id} className="plan-card">
            <div className="display" style={{ fontSize: 24 }}>
              {pl.name}
            </div>
            <div style={{ fontSize: 32, fontWeight: 600 }}>
              ₪{pl.price}
              <span className="muted" style={{ fontSize: 14 }}>
                /חודש
              </span>
            </div>
            <div
              style={{
                borderTop: '1px solid var(--border)',
                paddingTop: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                fontSize: 14,
              }}
            >
              <div>{pl.points} נקודות בחודש</div>
              <div>עד {pl.maxItems} תכשיטים במקביל</div>
              <div>{pl.exchanges} החלפות בחודש</div>
              <div>{pl.shippingLabel}</div>
            </div>
            <Button
              type="button"
              className="btn btn-primary"
              style={{ marginTop: 8, padding: 14 }}
              loadingText="שומר…"
              onClick={() => subscribe(pl.id)}
            >
              הצטרפי למסלול
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
