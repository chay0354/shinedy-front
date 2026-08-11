import { useEffect, useState } from 'react'
import Art from './Art.jsx'

const FIELDS = [
  { k: 'street', lab: 'רחוב', req: true },
  { k: 'houseNo', lab: 'מס׳ בית', req: true },
  { k: 'apt', lab: 'דירה' },
  { k: 'city', lab: 'עיר', req: true },
  { k: 'zip', lab: 'מיקוד' },
  { k: 'notes', lab: 'הערות לשליח' },
]

export const addressLine = (a) => {
  if (!a || !a.street) return ''
  const street = [a.street, a.houseNo].filter(Boolean).join(' ')
  const apt = a.apt ? `דירה ${a.apt}` : ''
  return [street, apt, a.city, a.zip].filter(Boolean).join(', ')
}

// מסך הרכישה. ללקוחה מנויה (user) — שם, כתובת וכרטיס אשראי מתמלאים מהמערכת,
// עם אפשרות להחליף כל אחד מהם ולממש קרדיטים. לאורחת (user=null) — טופס פרטים מלא.
export default function PurchaseDialog({ open, onClose, item, price, credit, user, onConfirm }) {
  const guest = !user
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [editAddr, setEditAddr] = useState(false)
  const [addr, setAddr] = useState({})
  const [saveAddr, setSaveAddr] = useState(true)
  const [editCard, setEditCard] = useState(false)
  const [cardNum, setCardNum] = useState('')
  const [cardExp, setCardExp] = useState('')
  const [cardHolder, setCardHolder] = useState('')
  const [saveCard, setSaveCard] = useState(true)
  const [useCredit, setUseCredit] = useState(true)
  const [amount, setAmount] = useState(0)

  const maxCredit = guest ? 0 : Math.min(Math.floor(credit || 0), price || 0)

  useEffect(() => {
    if (!open) return
    setName(user ? user.name : '')
    setPhone(user ? user.phone || '' : '')
    setEmail(user ? user.email || '' : '')
    setAddr(user ? { ...user.address } : {})
    setEditAddr(!addressLine(user && user.address))   // אין כתובת שמורה — ישר מצב עריכה
    setSaveAddr(true)
    setEditCard(!(user && user.payment))              // אין כרטיס שמור — ישר מצב עריכה
    setCardNum(''); setCardExp(''); setCardHolder(user ? user.name : '')
    setSaveCard(true)
    setUseCredit(maxCredit > 0)
    setAmount(maxCredit)
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('keydown', onKey) }
  }, [open, onClose])

  if (!open || !item) return null

  const creditUsed = useCredit ? Math.min(maxCredit, Math.max(0, Number(amount) || 0)) : 0
  const toPay = Math.max(0, price - creditUsed)

  const digits = cardNum.replace(/\D/g, '')
  const cardOk = editCard ? digits.length >= 8 && cardExp.trim() : true
  const missingAddr = !addr.street || !addr.city || !addr.houseNo
  const missingName = !name.trim()
  const canBuy = !missingAddr && !missingName && cardOk

  function confirm() {
    const opts = {
      creditToUse: creditUsed,
      recipient: name.trim(),
      address: addr,
      saveAddress: !guest && editAddr && saveAddr,
    }
    if (editCard) {
      opts.payment = { holder: cardHolder.trim() || name.trim(), last4: digits.slice(-4), expiry: cardExp.trim() }
      opts.savePayment = !guest && saveCard
    }
    if (guest) opts.buyer = { name: name.trim(), phone: phone.trim(), email: email.trim() }
    onConfirm(opts)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card buy-card" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button className="modal-x" onClick={onClose} aria-label="סגירה">×</button>
        <h2>רכישת תכשיט</h2>

        <div className="buy-item">
          <div className="thumb"><Art product={item.product} /></div>
          <div className="grow">
            <div style={{ fontWeight: 600 }}>{item.product.name}</div>
            <div className="cell-sub" dir="ltr">{item.product.sku}{item.serial ? ` · ${item.serial}` : ''}</div>
          </div>
          <div className="buy-price">₪{price.toLocaleString()}</div>
        </div>

        <div className="buy-sec">
          <div className="buy-sec-head"><span>{guest ? 'הפרטים שלך' : 'שם המקבלת'}</span></div>
          <div className="buy-fields">
            <div className="field"><label>שם מלא *</label>
              <input className="f-name" value={name} onChange={(e) => setName(e.target.value)} /></div>
            {guest && (
              <>
                <div className="field"><label>טלפון נייד</label>
                  <input className="f-phone" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
                <div className="field"><label>אימייל</label>
                  <input className="f-email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              </>
            )}
          </div>
        </div>

        <div className="buy-sec">
          <div className="buy-sec-head">
            <span>כתובת למשלוח</span>
            {!editAddr && <button type="button" className="link-btn" onClick={() => setEditAddr(true)}>החלפת כתובת</button>}
          </div>
          {!editAddr ? (
            <p className="buy-addr">{addressLine(addr) || 'לא הוזנה כתובת'}{addr.notes ? ` · ${addr.notes}` : ''}</p>
          ) : (
            <>
              <div className="buy-fields">
                {FIELDS.map((f) => (
                  <div className="field" key={f.k}>
                    <label>{f.lab}{f.req ? ' *' : ''}</label>
                    <input value={addr[f.k] || ''} onChange={(e) => setAddr({ ...addr, [f.k]: e.target.value })} />
                  </div>
                ))}
              </div>
              {!guest && (
                <label className="check-row">
                  <input type="checkbox" checked={saveAddr} onChange={(e) => setSaveAddr(e.target.checked)} />
                  <span>לעדכן את הכתובת גם בפרטי המנוי שלי</span>
                </label>
              )}
            </>
          )}
        </div>

        <div className="buy-sec">
          <div className="buy-sec-head">
            <span>אמצעי תשלום</span>
            {!editCard && <button type="button" className="link-btn" onClick={() => setEditCard(true)}>החלפת כרטיס</button>}
          </div>
          {/* הרינדור הראשון רץ לפני ה-effect — חייבים לוודא שיש כרטיס שמור לפני שמציגים אותו */}
          {!editCard && user && user.payment ? (
            <p className="buy-addr pay-line" dir="ltr">
              •••• •••• •••• {user.payment.last4} · {user.payment.expiry} · {user.payment.holder}
            </p>
          ) : (
            <>
              <div className="buy-fields">
                <div className="field"><label>מספר כרטיס *</label>
                  <input className="card-number" dir="ltr" inputMode="numeric" placeholder="0000 0000 0000 0000"
                    value={cardNum} onChange={(e) => setCardNum(e.target.value)} /></div>
                <div className="field"><label>תוקף *</label>
                  <input className="card-expiry" dir="ltr" placeholder="MM/YY"
                    value={cardExp} onChange={(e) => setCardExp(e.target.value)} /></div>
                <div className="field"><label>שם בעל/ת הכרטיס</label>
                  <input className="card-holder" value={cardHolder} onChange={(e) => setCardHolder(e.target.value)} /></div>
              </div>
              {!guest && (
                <label className="check-row">
                  <input type="checkbox" checked={saveCard} onChange={(e) => setSaveCard(e.target.checked)} />
                  <span>לשמור את הכרטיס לרכישות הבאות</span>
                </label>
              )}
              <p className="cell-sub" style={{ marginTop: 6 }}>
                דמו — הפרטים אינם נשלחים לסליקה; נשמרות רק 4 הספרות האחרונות.
              </p>
            </>
          )}
        </div>

        {!guest && (
          <div className="buy-sec">
            <div className="buy-sec-head"><span>קרדיטים</span></div>
            {maxCredit > 0 ? (
              <>
                <label className="check-row">
                  <input type="checkbox" checked={useCredit} onChange={(e) => setUseCredit(e.target.checked)} />
                  <span>להוריד את הקרדיטים מהסכום — יתרה זמינה ₪{Math.floor(credit).toLocaleString()}</span>
                </label>
                {useCredit && (
                  <div className="field" style={{ maxWidth: 220, marginTop: 10 }}>
                    <label>כמה קרדיט לממש (עד ₪{maxCredit.toLocaleString()})</label>
                    <input type="number" min="0" max={maxCredit} value={amount}
                      onChange={(e) => setAmount(Math.min(maxCredit, Math.max(0, Number(e.target.value) || 0)))} />
                  </div>
                )}
              </>
            ) : (
              <p className="cell-sub">אין כרגע יתרת קרדיטים לניצול.</p>
            )}
          </div>
        )}

        <div className="buy-total">
          <div><span>מחיר התכשיט</span><span>₪{price.toLocaleString()}</span></div>
          {!guest && <div><span>קרדיטים שמומשו</span><span>−₪{Math.round(creditUsed).toLocaleString()}</span></div>}
          <div className="sum"><span>לתשלום</span><span>₪{Math.round(toPay).toLocaleString()}</span></div>
        </div>

        {missingName && <p className="form-err">צריך למלא שם מלא.</p>}
        {missingAddr && <p className="form-err">צריך למלא רחוב, מספר בית ועיר כדי להמשיך.</p>}
        {!cardOk && <p className="form-err">צריך למלא מספר כרטיס ותוקף.</p>}

        <button className="btn btn-wide" disabled={!canBuy} onClick={confirm}>
          אישור רכישה · ₪{Math.round(toPay).toLocaleString()}
        </button>
        <button type="button" className="modal-cancel" onClick={onClose}>ביטול</button>
      </div>
    </div>
  )
}
