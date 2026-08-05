export default function InfoPage() {
  const faqs = [
    {
      q: 'מה קורה אם תכשיט מתקלקל?',
      a: 'התכשיט חוזר לבדיקת המחסן שלנו לתיקון או ניקוי, ואת יכולה לבחור תכשיט חלופי.',
    },
    {
      q: 'כמה פעמים אפשר להחליף?',
      a: 'בהתאם למסלול שלך — כל מסלול כולל מספר החלפות חודשי.',
    },
    {
      q: 'האם אפשר לקנות תכשיט שהשכרתי?',
      a: 'כן, במחיר הרכישה בניכוי הקרדיטים שצברת.',
    },
  ];

  return (
    <div className="page page-narrow" style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
      <div>
        <div className="display" style={{ fontSize: 26, marginBottom: 16 }}>
          שאלות נפוצות
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {faqs.map((f) => (
            <div key={f.q} className="panel" style={{ padding: 16 }}>
              <div style={{ fontWeight: 600 }}>{f.q}</div>
              <div className="muted" style={{ fontSize: 13, marginTop: 6 }}>
                {f.a}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="display" style={{ fontSize: 26, marginBottom: 12 }}>
          אודות
        </div>
        <div className="muted" style={{ lineHeight: 1.7 }}>
          Shinedy מאפשרת ליהנות מתכשיטים איכותיים במודל מנוי, בלי להתחייב לרכישה.
          בוחרים, לובשים, מחליפים.
        </div>
      </div>

      <div>
        <div className="display" style={{ fontSize: 26, marginBottom: 12 }}>
          צור קשר
        </div>
        <div style={{ maxWidth: 420 }}>
          <input className="field" placeholder="שם" />
          <input className="field" placeholder="דוא״ל" />
          <textarea className="field" placeholder="הודעה" style={{ minHeight: 80 }} />
          <button type="button" className="btn btn-primary" style={{ padding: 14 }}>
            שליחה
          </button>
        </div>
      </div>
    </div>
  );
}
