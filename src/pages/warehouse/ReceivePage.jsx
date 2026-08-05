import { api } from '../../api';
import { useApp } from '../../state/AppContext';

export default function ReceivePage() {
  const { state, run } = useApp();

  return (
    <>
      <div className="display" style={{ fontSize: 22, marginBottom: 20 }}>
        קליטת מלאי חדש
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
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => run(() => api.receiveUnit(p.id))}
            >
              קליטת יחידה
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
