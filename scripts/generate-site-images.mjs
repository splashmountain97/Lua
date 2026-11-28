// Responsive derivatives of the app's own artwork for the marketing site.
//
// The onboarding drawings are 1.5–2.8k pixels on their long side and
// weigh half a megabyte each as JPEG. The site never sends those to a phone:
// each is written here at a few widths in AVIF, WebP and JPEG, and the pages
// pick with <picture>. The outputs are committed under site/img so the deploy
// does not spend a minute re-encoding AVIF on every build — rerun this after
// replacing a source drawing.
//
//   node scripts/generate-site-images.mjs
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.join(__dirname, '..', 'src', 'assets');
const OUT = path.join(__dirname, '..', 'site', 'img');
await mkdir(OUT, { recursive: true });

const FORMATS = [
  ['avif', img => img.avif({ quality: 52, effort: 6 })],
  ['webp', img => img.webp({ quality: 78 })],
  ['jpg', img => img.jpeg({ quality: 80, mozjpeg: true })],
];

async function variants(src, name, widths, { crop } = {}) {
  for (const w of widths) {
    for (const [ext, encode] of FORMATS) {
      let img = sharp(path.join(ASSETS, src));
      if (crop) img = img.extract(crop);
      await encode(img.resize({ width: w, withoutEnlargement: true })).toFile(path.join(OUT, `${name}-${w}.${ext}`));
    }
  }
  console.log(`${name}: ${widths.join('/')} in ${FORMATS.map(f => f[0]).join('/')}`);
}

// The two portraits (1536×2752) on the home page.
await variants('ob-1-ruins.jpeg', 'ruins', [480, 720, 960, 1536]);
await variants('ob-2-walking.jpeg', 'walking', [480, 720, 960, 1536]);

// The helmet (2816×1536) is only on the preview card, site/og.html.
await variants('ob-3-helmet.jpeg', 'helmet', [1800]);
await sharp(path.join(ASSETS, 'glass-swirl.png')).webp({ quality: 80, alphaQuality: 90 }).toFile(path.join(OUT, 'swirl.webp'));
console.log('swirl: webp');
