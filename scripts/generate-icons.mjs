// One-off build script: composites the app's own moon object into PWA icon
// PNGs, per "Concept A" from the design's app-icon spec (Lua.dc.html) — the
// object itself, cropped to the bezel, rather than a redrawn glyph.
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.join(__dirname, '..', 'src', 'assets');
const OUT = path.join(__dirname, '..', 'public');

const WXf = 0.6034, WYf = 0.3521, WRf = 0.174;

// sharp's composite() requires the overlay to fit within the base canvas, so
// any part of a scaled-up image that would fall outside the canvas has to be
// cropped off first rather than placed with a negative/overflowing offset.
async function clampedOverlay(imgBuffer, imgSize, left, top, canvasSize) {
  const cropLeft = Math.max(0, -left);
  const cropTop = Math.max(0, -top);
  const cropRight = Math.min(imgSize, canvasSize - left);
  const cropBottom = Math.min(imgSize, canvasSize - top);
  const width = Math.round(cropRight - cropLeft);
  const height = Math.round(cropBottom - cropTop);
  const cropped = await sharp(imgBuffer)
    .extract({ left: Math.round(cropLeft), top: Math.round(cropTop), width, height })
    .toBuffer();
  return { input: cropped, left: Math.max(0, Math.round(left)), top: Math.max(0, Math.round(top)) };
}

async function buildIcon({ size, f, wx, wy, ground, outFile }) {
  const iw = f * size;
  const ox = wx === null ? (size - iw) / 2 : wx * size - WXf * iw;
  const oy = wy === null ? (size - iw) / 2 : wy * size - WYf * iw;
  const wr = WRf * iw;
  const wcx = ox + WXf * iw, wcy = oy + WYf * iw;
  const wSize = wr * 2;
  const wLeft = wcx - wr, wTop = wcy - wr;

  const circleMask = Buffer.from(
    `<svg width="${Math.round(wSize)}" height="${Math.round(wSize)}"><circle cx="${wSize / 2}" cy="${wSize / 2}" r="${wSize / 2}" fill="#fff"/></svg>`
  );

  const moonBuf = await sharp(path.join(ASSETS, 'moon-body.png')).resize(Math.round(iw), Math.round(iw)).toBuffer();
  const swirlBuf = await sharp(path.join(ASSETS, 'glass-swirl.png'))
    .resize(Math.round(wSize), Math.round(wSize))
    .composite([{ input: circleMask, blend: 'dest-in' }])
    .toBuffer();

  const moonOverlay = await clampedOverlay(moonBuf, Math.round(iw), ox, oy, size);
  const swirlOverlay = await clampedOverlay(swirlBuf, Math.round(wSize), wLeft, wTop, size);

  // The icon canvas is always fully covered (ground + object), so there's no
  // real alpha to preserve — flatten and ship as JPEG, far smaller than PNG
  // for this photographic content.
  await sharp({ create: { width: size, height: size, channels: 4, background: ground } })
    .composite([moonOverlay, swirlOverlay])
    .flatten()
    .jpeg({ quality: 85 })
    .toFile(path.join(OUT, outFile));
  console.log('wrote', outFile);
}

// Concept A — sphere bleeds past the square, window off-centre where it really is.
await buildIcon({ size: 512, f: 1.34, wx: 0.5, wy: 0.46, ground: '#1a1c26', outFile: 'icon-512.jpg' });
await buildIcon({ size: 192, f: 1.34, wx: 0.5, wy: 0.46, ground: '#1a1c26', outFile: 'icon-192.jpg' });
// Concept C — whole object, real margin: used for the maskable icon, which needs a safe zone.
await buildIcon({ size: 512, f: 0.84, wx: null, wy: null, ground: '#161826', outFile: 'icon-512-maskable.jpg' });
