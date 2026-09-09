import { useEffect, useRef } from 'react';

export default function SignaturePad({ value, onChange }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);
  onChangeRef.current = onChange;
  valueRef.current = value;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = canvas.getBoundingClientRect();
      if (width < 8 || height < 8) return;
      const prev = canvas.toDataURL();
      canvas.width = Math.max(1, Math.round(width * ratio));
      canvas.height = Math.max(1, Math.round(height * ratio));
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#171310';
      if (valueRef.current || prev) {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0, width, height);
        img.src = valueRef.current || prev;
      }
    };

    const pos = (e) => {
      const r = canvas.getBoundingClientRect();
      const src = e.touches?.[0] || e.changedTouches?.[0] || e;
      return { x: src.clientX - r.left, y: src.clientY - r.top };
    };

    const start = (e) => {
      e.preventDefault();
      drawing.current = true;
      const { x, y } = pos(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
    };

    const move = (e) => {
      if (!drawing.current) return;
      e.preventDefault();
      const { x, y } = pos(e);
      ctx.lineTo(x, y);
      ctx.stroke();
    };

    const stop = (e) => {
      if (!drawing.current) return;
      e.preventDefault();
      drawing.current = false;
      onChangeRef.current?.(canvas.toDataURL('image/png'));
    };

    resize();
    const opts = { passive: false };
    canvas.addEventListener('pointerdown', start);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', stop);
    canvas.addEventListener('pointercancel', stop);
    canvas.addEventListener('touchstart', start, opts);
    canvas.addEventListener('touchmove', move, opts);
    canvas.addEventListener('touchend', stop, opts);
    canvas.addEventListener('touchcancel', stop, opts);
    window.addEventListener('resize', resize);
    return () => {
      canvas.removeEventListener('pointerdown', start);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', stop);
      canvas.removeEventListener('pointercancel', stop);
      canvas.removeEventListener('touchstart', start, opts);
      canvas.removeEventListener('touchmove', move, opts);
      canvas.removeEventListener('touchend', stop, opts);
      canvas.removeEventListener('touchcancel', stop, opts);
      window.removeEventListener('resize', resize);
    };
  }, []);

  function clear() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChangeRef.current?.('');
  }

  return (
    <div className="sig-wrap">
      <canvas ref={canvasRef} className="sig-pad" aria-label="שדה חתימה" />
      <button type="button" className="btn-mini" onClick={clear}>
        ניקוי חתימה
      </button>
    </div>
  );
}
