import { QRCodeSVG } from 'qrcode.react';

/** Real scannable QR for return pouches (qrcode.react) */
export default function QrCard({ code, size = 180 }) {
  const value = String(code || '').trim() || 'SHINEDY';

  return (
    <div className="qr-card" style={{ width: size }}>
      <div
        className="qr-real"
        style={{ width: size, height: size }}
        role="img"
        aria-label={`קוד QR ${value}`}
      >
        <QRCodeSVG
          value={value}
          size={size}
          level="M"
          includeMargin
          bgColor="#FFFFFF"
          fgColor="#221F1B"
        />
      </div>
      <div className="qr-code-label">{value}</div>
    </div>
  );
}
