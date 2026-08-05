import { useNavigate } from 'react-router-dom';
import ImageSlot from '../../components/ImageSlot';
import { useApp } from '../../state/AppContext';
import { customerStatusLabel } from '../../utils/customerStatus';
import Button from '../../components/Button';

export default function DashboardPage() {
  const { state } = useApp();
  const navigate = useNavigate();
  const actions = [
    {
      title: 'החזרת תכשיטים',
      text: 'סמני מה להחזיר — הנקודות יחזרו אחרי אישור המחסן',
      to: '/account/exchange',
      primary: true,
    },
    {
      title: 'היסטוריה וחשבוניות',
      text: 'השכרות, החלפות וחשבוניות קודמות',
      to: '/account/history',
    },
  ];

  return (
    <>
      <div className="display" style={{ fontSize: 28, marginBottom: 8 }}>
        אזור אישי
      </div>
      <div className="muted" style={{ fontSize: 14, marginBottom: 28 }}>
        כאן תראי את התכשיטים שלך, סטטוסים, ותוכלי לבצע החלפה והחזרה
      </div>

      <div className="stat-row">
        <div className="stat-card">
          <div className="muted" style={{ fontSize: 13 }}>
            מסלול
          </div>
          <div className="display" style={{ fontSize: 22, marginTop: 4 }}>
            {state.plan.name}
          </div>
          <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
            ₪{state.plan.price} לחודש
          </div>
        </div>
        <div className="stat-card">
          <div className="muted" style={{ fontSize: 13 }}>
            יתרת נקודות
          </div>
          <div className="display" style={{ fontSize: 22, marginTop: 4 }}>
            {state.pointsBalance} / {state.pointsTotal}
          </div>
          <div className="progress">
            <div style={{ width: `${state.pointsPct}%` }} />
          </div>
        </div>
        <div className="stat-card">
          <div className="muted" style={{ fontSize: 13 }}>
            קרדיטים שנצברו
          </div>
          <div className="display" style={{ fontSize: 22, marginTop: 4 }}>
            ₪{state.credits}
          </div>
          <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
            לניצול ברכישת תכשיט
          </div>
        </div>
      </div>

      {(state.myActiveOrders || []).length > 0 && (
        <>
          <div className="display" style={{ fontSize: 20, marginBottom: 14 }}>
            הזמנות פעילות
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
            {state.myActiveOrders.map((o) => (
              <div key={o.id} className="panel" style={{ padding: 18 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 12,
                    flexWrap: 'wrap',
                    marginBottom: o.itemsDetail?.length ? 14 : 0,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>
                      {o.type} · {o.id}
                    </div>
                    <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                      {o.date}
                    </div>
                  </div>
                  <span
                    className="badge"
                    style={{ background: 'var(--accent-soft)', color: '#8A6A2A' }}
                  >
                    {o.customerStatus}
                  </span>
                </div>

                {o.inTransitItems?.length > 0 && (
                  <div className="muted" style={{ fontSize: 12, marginBottom: 10 }}>
                    בדרך אליי ({o.inTransitItems.length})
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(o.itemsDetail || []).map((it) => (
                    <div
                      key={it.unitId}
                      style={{
                        display: 'flex',
                        gap: 12,
                        alignItems: 'center',
                        borderBottom: '1px solid var(--border)',
                        paddingBottom: 10,
                      }}
                    >
                      <div className="thumb" style={{ width: 44, height: 44 }}>
                        <ImageSlot
                          label={it.name}
                          category={it.category}
                          productId={it.unitId}
                          className="compact"
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{it.name}</div>
                        <div className="muted" style={{ fontSize: 12 }}>
                          {it.category}
                        </div>
                      </div>
                      <span
                        className="badge"
                        style={{ background: it.badgeBg, color: it.badgeFg }}
                      >
                        {it.statusLabel}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="display" style={{ fontSize: 20, marginBottom: 14 }}>
        פעולות
      </div>
      <div
        className="product-grid"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', marginBottom: 32 }}
      >
        {actions.map((a) => (
          <button
            key={a.to}
            type="button"
            className="panel"
            onClick={() => navigate(a.to)}
            style={{
              textAlign: 'right',
              cursor: 'pointer',
              padding: 18,
              borderColor: a.primary ? 'var(--ink)' : undefined,
              background: a.primary ? 'var(--ink)' : undefined,
              color: a.primary ? 'var(--bg)' : undefined,
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 15 }}>{a.title}</div>
            <div
              style={{
                fontSize: 12,
                marginTop: 6,
                opacity: a.primary ? 0.75 : 1,
                color: a.primary ? undefined : 'var(--muted)',
              }}
            >
              {a.text}
            </div>
          </button>
        ))}
      </div>

      {(state.myReturnPouches || []).length > 0 && (
        <div
          className="panel"
          style={{
            padding: 16,
            marginBottom: 24,
            background: 'var(--accent-soft)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ fontWeight: 600 }}>החזרה פעילה</div>
            <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
              {state.myReturnPouches[0].statusLabel}
            </div>
          </div>
          <Button
            type="button"
            className="btn btn-sm"
            onClick={() => navigate('/account/returns')}
          >
            פרטי החזרה
          </Button>
        </div>
      )}

      <div className="display" style={{ fontSize: 20, marginBottom: 16 }}>
        התכשיטים שלי
      </div>

      {state.myItems.length === 0 ? (
        <div className="empty">עדיין לא הזמנת תכשיטים</div>
      ) : (
        <div className="product-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {state.myItems.map((it) => (
            <div
              key={it.unitId}
              className="panel"
              style={{ display: 'flex', gap: 12, alignItems: 'center' }}
            >
              <div className="thumb" style={{ width: 56, height: 56 }}>
                <ImageSlot
                  label={it.name}
                  category={it.category}
                  productId={it.unitId}
                  className="compact"
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{it.name}</div>
                <div className="muted" style={{ fontSize: 12 }}>
                  {it.category}
                </div>
              </div>
              <span className="badge" style={{ background: it.badgeBg, color: it.badgeFg }}>
                {customerStatusLabel(it.status)}
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
