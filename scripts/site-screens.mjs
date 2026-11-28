// The three app screens the site shows, from the real captures the App Store
// listing uses (lua-app/docs/screenshots/raw, 1320×2868 PNG straight off the
// simulator). Each is written at two widths in AVIF, WebP and PNG, and the
// phone frame on the page picks with <picture>. Outputs are committed under
// site/screens; rerun after recapturing.
//
//   node scripts/site-screens.mjs [path/to/raw]
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = process.argv[2] ?? path.join(__dirname, '..', '..', 'lua-app', 'docs', 'screenshots', 'raw');
const OUT = path.join(__dirname, '..', 'site', 'screens');
await mkdir(OUT, { recursive: true });

// site name → capture file
const SCREENS = { question: 'q-heavy', filters: 'filters', share: 'share' };

for (const [name, file] of Object.entries(SCREENS)) {
  for (const [suffix, width] of [['', 804], ['-sm', 402]]) {
    const img = () => sharp(path.join(SRC, `${file}.png`)).resize({ width, kernel: 'lanczos3' });
    await img().avif({ quality: 55, effort: 6 }).toFile(path.join(OUT, `${name}${suffix}.avif`));
    await img().webp({ quality: 82 }).toFile(path.join(OUT, `${name}${suffix}.webp`));
    if (!suffix) await img().png({ compressionLevel: 9 }).toFile(path.join(OUT, `${name}.png`));
  }
  console.log(`${name} ← ${file}.png`);
}
