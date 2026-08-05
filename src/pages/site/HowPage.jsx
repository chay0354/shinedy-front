export default function HowPage() {
  const steps = [
    {
      n: 1,
      title: 'בוחרים מסלול מנוי',
      text: 'כל מסלול נותן מכסת נקודות חודשית, מספר תכשיטים מקסימלי, ומספר החלפות.',
    },
    {
      n: 2,
      title: 'בוחרים תכשיטים בנקודות',
      text: 'לכל תכשיט ערך נקודות. ניתן לבחור תכשיטים עד למכסת הנקודות של המסלול.',
    },
    {
      n: 3,
      title: 'מחליפים כשרוצים',
      text: 'מחזירים תכשיט, הנקודות חוזרות ליתרה, ובוחרים תכשיט חדש. אנחנו שולחים נרתיק החזרה עם קוד QR.',
    },
  ];

  return (
    <div className="page page-narrow">
      <div className="display" style={{ fontSize: 34, marginBottom: 32 }}>
        איך זה עובד
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {steps.map((s) => (
          <div
            key={s.n}
            className="panel"
            style={{ display: 'flex', gap: 20, padding: 20 }}
          >
            <div className="display accent" style={{ fontSize: 22 }}>
              {s.n}
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>{s.title}</div>
              <div className="muted" style={{ fontSize: 14, marginTop: 4 }}>
                {s.text}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="callout">
        <div style={{ fontWeight: 600, marginBottom: 8 }}>נקודות מול קרדיטים</div>
        <div className="muted" style={{ fontSize: 14, lineHeight: 1.7 }}>
          נקודות הן המכסה החודשית שקובעת אילו תכשיטים אפשר לבחור במסגרת המנוי. קרדיטים
          הם סכום שמצטבר לאורך המנוי וניתן לממש אותו לרכישת תכשיט לצמיתות במחיר מוזל.
        </div>
      </div>
    </div>
  );
}
