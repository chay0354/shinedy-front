import { useEffect, useRef, useState } from 'react';

const cache = new Map();
const inflight = new Map();

function maxEdge() {
  return window.matchMedia('(max-width: 720px)').matches ? 420 : 720;
}

function cutout(img) {
  const limit = maxEdge();
  const scale = Math.min(1, limit / Math.max(img.naturalWidth, img.naturalHeight));
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, width, height);
  const frame = ctx.getImageData(0, 0, width, height);
  const data = frame.data;
  const count = width * height;
  const seen = new Uint8Array(count);
  const stack = [];

  const isBackground = (index) =>
    data[index] > 232 && data[index + 1] > 232 && data[index + 2] > 232;

  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const pixel = y * width + x;
    if (seen[pixel]) return;
    if (!isBackground(pixel * 4)) return;
    seen[pixel] = 1;
    stack.push(pixel);
  };

  for (let x = 0; x < width; x += 1) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    push(0, y);
    push(width - 1, y);
  }

  while (stack.length) {
    const pixel = stack.pop();
    data[pixel * 4 + 3] = 0;
    const x = pixel % width;
    const y = (pixel - x) / width;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }

  ctx.putImageData(frame, 0, 0);
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

function whenIdle(fn) {
  if (typeof requestIdleCallback === 'function') {
    const id = requestIdleCallback(fn, { timeout: 1200 });
    return () => cancelIdleCallback(id);
  }
  const id = setTimeout(fn, 48);
  return () => clearTimeout(id);
}

function process(src) {
  if (cache.has(src)) return Promise.resolve(cache.get(src));
  if (inflight.has(src)) return inflight.get(src);

  const job = new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      whenIdle(() => {
        cutout(img)
          .then((blob) => {
            if (!blob) {
              resolve(src);
              return;
            }
            const url = URL.createObjectURL(blob);
            cache.set(src, url);
            resolve(url);
          })
          .catch(() => resolve(src))
          .finally(() => inflight.delete(src));
      });
    };
    img.onerror = () => {
      inflight.delete(src);
      resolve(src);
    };
    img.src = src;
  });

  inflight.set(src, job);
  return job;
}

export default function CutoutImage({ src, alt, className = '' }) {
  const [url, setUrl] = useState(() => cache.get(src) || src);
  const nodeRef = useRef(null);

  useEffect(() => {
    if (!src) return undefined;
    if (cache.has(src)) {
      setUrl(cache.get(src));
      return undefined;
    }
    setUrl(src);
    let alive = true;
    const node = nodeRef.current;

    const start = () => {
      process(src).then((ready) => {
        if (alive) setUrl(ready);
      });
    };

    if (!node || typeof IntersectionObserver === 'undefined') {
      start();
      return () => {
        alive = false;
      };
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        start();
      },
      { rootMargin: '160px 0px' },
    );
    io.observe(node);
    return () => {
      alive = false;
      io.disconnect();
    };
  }, [src]);

  return (
    <img
      ref={nodeRef}
      src={url}
      alt={alt}
      className={className || undefined}
      loading="lazy"
      decoding="async"
    />
  );
}
