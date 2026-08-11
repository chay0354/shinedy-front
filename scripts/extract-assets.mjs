import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');
const htmlPath = fs.existsSync(path.join(root, 'Shinedy-Dev-Package (1)/Shinedy.html'))
  ? path.join(root, 'Shinedy-Dev-Package (1)/Shinedy.html')
  : path.join(root, 'Shinedy-Dev-Package/Shinedy.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const mapping = [
  { file: 'brand/symbol-black.png', hints: ['symbol-black', 'faq-sym', 'rel="icon"'] },
  { file: 'brand/name-black.png', hints: ['name-black', 'className:"brand"'] },
  { file: 'brand/name-white.png', hints: ['name-white', 'site-footer'] },
  { file: 'brand/symbol-gold.png', hints: ['symbol-gold', 'hb-divider'] },
  { file: 'photos/hero-full.jpg', hints: ['hero-full.jpg', 'hero-band'] },
  { file: 'photos/hero-full2.jpg', hints: ['hero-full2', 'hb-mobile'] },
  { file: 'photos/bag.jpg', hints: ['bag.jpg', 'auth-photo'] },
  { file: 'photos/bg-cream.jpg', hints: ['bg-cream', 'cta-band'] },
  { file: 'photos/pearls.jpg', hints: ['pearls', 'about-split'] },
];

const re = /data:image\/(png|jpeg);base64,([A-Za-z0-9+/=]+)/g;
const uris = [];
let m;
while ((m = re.exec(html))) {
  uris.push({ mime: m[1], b64: m[2], start: m.index, len: m[0].length });
}
console.log('found', uris.length, 'data URIs');

const outDir = path.join(root, 'frontend/public');
for (const { file, hints } of mapping) {
  let best = null;
  let bestScore = -1;
  for (const u of uris) {
    const ctx = html.slice(Math.max(0, u.start - 400), u.start + u.len + 400);
    let score = 0;
    for (const h of hints) if (ctx.includes(h)) score++;
    if (score > bestScore) {
      bestScore = score;
      best = u;
    }
  }
  if (!best || bestScore === 0) {
    console.warn('SKIP (no match):', file);
    continue;
  }
  const dest = path.join(outDir, file);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, Buffer.from(best.b64, 'base64'));
  console.log('OK', file, `(${best.mime}, score=${bestScore})`);
}
