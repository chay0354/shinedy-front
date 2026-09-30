import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { QRCodeSVG } from 'qrcode.react'
import { SERVICE_PHONE } from '../lib/contact.js'

export function formatAddress(a) {
  if (!a) return ''
  const line1 = [a.street, a.houseNo].filter(Boolean).join(' ')
  const line2 = [a.apt && `דירה ${a.apt}`, a.floor && `קומה ${a.floor}`, a.entrance && `כניסה ${a.entrance}`].filter(Boolean).join(', ')
  const line3 = [a.city, a.zip].filter(Boolean).join(' ')
  return [line1, line2, line3].filter(Boolean).join('\n')
}

// Thermal-printer labels: every label is printed on its own page of the given size.
export default function PrintLabels({ title, width, height, onClose, children }) {
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `@media print { @page { size: ${width}mm ${height}mm; margin: 0; } }`
    document.head.appendChild(style)
    document.body.classList.add('has-label')
    return () => {
      style.remove()
      document.body.classList.remove('has-label')
    }
  }, [width, height])

  return createPortal(
    <div className="label-root" dir="rtl">
      <div className="label-bar">
        <b>{title}</b>
        <span className="cell-sub">{width}×{height} מ״מ · מדפסת תרמית</span>
        <div className="label-bar-actions">
          <button type="button" className="btn btn-sm" onClick={() => window.print()}>הדפסה</button>
          <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>סגירה</button>
        </div>
      </div>
      <div className="label-sheet" style={{ '--label-w': `${width}mm`, '--label-h': `${height}mm` }}>
        {children}
      </div>
    </div>,
    document.body,
  )
}

export function ShippingLabel({ id, recipient, phone, address, jobLabel, signatureLabel, planLabel, itemsCount, qrValue }) {
  return (
    <div className="label ship-label">
      <div className="ship-from">
        <b>SHINEDY</b>
        <span>שולח · <span dir="ltr">{SERVICE_PHONE}</span></span>
      </div>
      <div className="ship-to">
        <span className="ship-caption">אל</span>
        <div className="ship-name">{recipient || '—'}</div>
        <div className="ship-phone" dir="ltr">{phone || ''}</div>
        <div className="ship-address">{address || 'כתובת חסרה — יש להשלים בפרופיל הלקוחה'}</div>
      </div>
      <div className="ship-meta">
        {jobLabel && <span className="ship-job">{jobLabel}</span>}
        {signatureLabel && <span>{signatureLabel}</span>}
        {planLabel && <span>{planLabel}</span>}
        {itemsCount != null && <span>{itemsCount} פריטים</span>}
      </div>
      <div className="ship-bottom">
        <QRCodeSVG value={qrValue || id} size={140} />
        <div className="ship-id">
          <span className="ship-caption">מס׳ הזמנה</span>
          <b dir="ltr">{id}</b>
        </div>
      </div>
    </div>
  )
}

export function SkuLabel({ name, sku, serial, details }) {
  return (
    <div className="label sku-label">
      <QRCodeSVG value={serial || sku} size={96} />
      <div className="sku-text">
        <b className="sku-serial" dir="ltr">{serial || sku}</b>
        <span className="sku-name">{name}</span>
        {serial && sku && <span>דגם <span dir="ltr">{sku}</span></span>}
        {details && <span>{details}</span>}
      </div>
    </div>
  )
}
