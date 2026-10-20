import { useEffect, useState } from 'react';

/**
 * The catalog shots are JPGs on an off-white studio background. Flood-fill from
 * the edges and clear those pixels, so the jewelry sits on the card color.
 * Highlights inside the piece are not connected to the edge, so they stay.
 */
function cutout(img) {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);
  const { width, height } = canvas;
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
    const index = pixel * 4;
    if (!isBackground(index)) return;
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
    const y = Math.floor(pixel / width);
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }

  ctx.putImageData(frame, 0, 0);
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

export default function CutoutImage({ src, alt }) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    let alive = true;
    let objectUrl = null;
    const img = new Image();
    img.onload = () => {
      cutout(img).then((blob) => {
        if (!alive || !blob) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      });
    };
    img.src = src;
    return () => {
      alive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  if (!url) return null;
  return <img src={url} alt={alt} />;
}
