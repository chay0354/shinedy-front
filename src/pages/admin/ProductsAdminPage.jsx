import ImageSlot from '../../components/ImageSlot';
import { api } from '../../api';
import { useApp } from '../../state/AppContext';

export default function ProductsAdminPage() {
  const { state, run } = useApp();

  return (
    <>
      <div className="display" style={{ fontSize: 22, marginBottom: 8 }}>
        מוצרים בחנות
      </div>
      <div className="muted" style={{ fontSize: 13, marginBottom: 20, maxWidth: 640, lineHeight: 1.6 }}>
        כאן רואים את כל הפריטים בקטלוג, מעדכנים נקודות ומחיר, ומוסיפים יחידות חדשות למלאי בלשונית «הוספת פריטים למלאי».
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>תמונה</th>
            <th>דגם</th>
            <th>שם</th>
            <th>קטגוריה</th>
            <th>מתכת</th>
            <th>אבן</th>
            <th>נקודות</th>
            <th>מחיר רכישה</th>
            <th>זמינות</th>
          </tr>
        </thead>
        <tbody>
          {(state.products || []).map((p) => (
            <tr key={p.id}>
              <td>
                <div className="thumb" style={{ width: 44, height: 44 }}>
                  <ImageSlot label={p.name} category={p.category} productId={p.id} className="compact" />
                </div>
              </td>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>{p.category}</td>
              <td>{p.metal}</td>
              <td>{p.stone}</td>
              <td>
                <input
                  style={{ width: 60 }}
                  value={p.points}
                  onChange={(e) => run(() => api.updateProduct(p.id, 'points', e.target.value))}
                />
              </td>
              <td>
                <input
                  value={p.price}
                  onChange={(e) => run(() => api.updateProduct(p.id, 'price', e.target.value))}
                />
              </td>
              <td>{p.availCount} יח׳</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
