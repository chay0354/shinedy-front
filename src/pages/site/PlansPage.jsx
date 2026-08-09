import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { getToken } from '../../lib/auth';
import { useApp } from '../../state/AppContext';
import Button from '../../components/Button';
import { IconCheck } from '../../components/icons';

function planFeatures(plan) {
  return [
    `${plan.points} נקודות בחודש`,
    `עד ${plan.maxItems} תכשיטים במקביל`,
    `${plan.exchanges} החלפות בחודש`,
    plan.shippingLabel || (plan.shipping ? 'משלוח חינם' : 'משלוח בתשלום'),
  ];
}

export default function PlansPage() {
  const { state, run } = useApp();
  const navigate = useNavigate();
  const plans = state?.plans || [];
  const featuredIndex = plans.length > 1 ? 1 : 0;

  async function subscribe(planId) {
    if (!getToken()) {
      navigate('/login');
      return;
    }
    const data = await run(() => api.subscribe(planId));
    if (!data) return;
    navigate('/account/shop');
  }

  return (
    <section className="site-section">
      <div className="shell">
        <div className="section-head">
          <h2 className="section-title">מסלולי מנוי</h2>
          <p className="section-sub">בחרי את המסלול שמתאים לך — אפשר לשדרג בכל שלב</p>
        </div>

        <div className="plans-grid">
          {plans.map((plan, i) => {
            const featured = i === featuredIndex;
            return (
              <div key={plan.id} className={`plan-tile${featured ? ' plan-tile-featured' : ''}`}>
                {featured ? <span className="plan-badge">הכי פופולרי</span> : null}
                <h3 className="plan-name">{plan.name}</h3>
                <p className="plan-price">
                  ₪{plan.price}
                  <small>לחודש</small>
                </p>
                <ul className="plan-feats">
                  {planFeatures(plan).map((f) => (
                    <li key={f}>
                      <IconCheck />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  type="button"
                  className={featured ? 'btn-gold btn-block' : 'btn-ink btn-block'}
                  loadingText="שומר…"
                  onClick={() => subscribe(plan.id)}
                >
                  אני בוחרת
                </Button>
              </div>
            );
          })}
        </div>

        <p className="plan-note">ללא התחייבות · ניתן לבטל בכל עת</p>
      </div>
    </section>
  );
}
