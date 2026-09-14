import { Link, Navigate } from 'react-router-dom';
import { useApp } from '../../state/AppContext';
import { getToken } from '../../lib/auth';
import { activeUnits, heDate, openReturns } from '../../lib/accountHelpers';
import Art from '../../components/Art';
import PageHead from '../../components/PageHead';

export default function EndMembershipPage() {
  const { state } = useApp();
  if (!getToken()) return <Navigate to="/login" replace />;

  const suspended = Boolean(state?.registration?.suspended);
  const canceled = Boolean(state?.registration?.canceledAt) && !state?.subscribed;
  const mode = canceled ? 'ביטול' : suspended ? 'הקפאה' : 'סיום מנוי';
  const pouches = openReturns(state);
  const last = state?.lastPouch;
  const pouch = pouches[0] || last;
  const pouchItems = pouch?.items || [];
  const held = activeUnits(state);
  const items = pouchItems.length
    ? pouchItems.map((it) => ({
        serial: it.unitId,
        product: {
          name: it.name,
          metal: '',
          stone: '',
          points: it.points || 0,
        },
      }))
    : held;
  const charges = state?.shippingCharges || state?.registration?.shippingCharges || [];
  const latestFee = [...charges].reverse().find((c) => Number(c.amount) > 0);
  const fee = latestFee?.amount || 0;

  return (
    <>
      <PageHead eyebrow={canceled ? 'CANCELED' : 'PAUSED'} title={`${mode} מנוי`}>
        <p>
          {items.length
            ? 'התכשיטים שאצלך ממתינים לאיסוף. שליח יגיע אלייך בימים הקרובים.'
            : 'אין תכשיטים לאיסוף אצלך כרגע.'}
        </p>
      </PageHead>

      <section className="section" style={{ paddingTop: 24 }}>
        <div className="container" style={{ maxWidth: 720 }}>
          {fee > 0 && (
            <div className="blocked-panel" style={{ marginBottom: 22 }}>
              <b>מחויבת ב-₪{fee} דמי משלוח.</b>
              <p style={{ marginTop: 8 }}>
                בחודש המנוי הנוכחי כבר היה משלוח או החזרה, ולכן האיסוף בעקבות ה{mode} מחויב ב-₪{fee}.
              </p>
              {latestFee?.reason && <p className="cell-sub">{latestFee.reason} · {heDate(latestFee.at)}</p>}
            </div>
          )}

          <div className="signup-card" style={{ marginBottom: 22 }}>
            <h2 className="account-h2 first" style={{ marginTop: 0 }}>איסוף</h2>
            <p className="signup-pay-note">
              {items.length
                ? 'הזמנו שליח לאיסוף בלבד. הכניסי את התכשיטים לנרתיק — השליח יגיע בימים הקרובים.'
                : 'אין צורך באיסוף.'}
            </p>
            {pouch && (
              <p className="cell-sub">
                נרתיק {pouch.id}
                {pouch.statusLabel ? ` · ${pouch.statusLabel}` : ''}
              </p>
            )}
          </div>

          <h2 className="account-h2">הפריטים שאצלך</h2>
          {items.length === 0 ? (
            <p className="account-empty">אין פריטים לאיסוף.</p>
          ) : (
            <div className="items-list">
              {items.map((u) => (
                <div className="item-row" key={u.serial}>
                  <div className="thumb">
                    <Art product={u.product} />
                  </div>
                  <div className="grow">
                    <div className="item-name">{u.product.name}</div>
                    <div className="item-sub">
                      {[u.product.metal, u.product.stone, u.product.points ? `${u.product.points} נק׳` : '']
                        .filter(Boolean)
                        .join(' · ')}
                    </div>
                  </div>
                  <div className="status muted">לאיסוף</div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
            <Link to="/account/me" className="btn">
              לאזור האישי
            </Link>
            {suspended && (
              <Link to="/account/me" className="btn btn-outline">
                הפעלה מחדש מהאזור האישי
              </Link>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
