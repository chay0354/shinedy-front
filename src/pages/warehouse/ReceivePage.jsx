import { api } from '../../api';
import { useApp } from '../../state/AppContext';
import Button from '../../components/Button';

export default function ReceivePage() {
  const { state, run } = useApp();

  return (
    <>
      <div className="display" style={{ fontSize: 22, marginBottom: 8 }}>
        הוספת פריטים למלאי
      </div>
      <div className="muted" style={{ fontSize: 13, marginBottom: 20, maxWidth: 640, lineHeight: 1.6 }}>
        קליטת יחידה חדשה לכל דגם — הפריט יופיע ב«ניהול מלאי» כזמין.
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {(state.products || []).map((p) => (
          <div
            key={p.id}
            className="panel"
            style={{ display: 'flex', alignItems: 'center', gap: 14 }}
          >
            <span style={{ fontSize: 13 }}>
              {p.id} — {p.name}
            </span>
            <Button
              type="button"
              className="btn btn-sm"
              loadingText="קולט…"
              onClick={() => run(() => api.receiveUnit(p.id))}
            >
              קליטת יחידה
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}
