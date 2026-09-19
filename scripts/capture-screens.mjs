// Screenshots of the real app for the marketing site, driven through the
// installed Chrome. Nothing here is mocked: each state is the app itself at
// its 402×874 design canvas, at 2× so the phone frames on the site stay sharp.
//
// Needs the dev server (npm run dev) on :5173, and a Chrome at CHROME below.
//
//   node scripts/capture-screens.mjs
//
// Outputs are committed under site/screens; rerun after a visual change.
import puppeteer from 'puppeteer-core';
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'site', 'screens');
const ORIGIN = process.env.LUA_ORIGIN ?? 'http://localhost:5173';
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

await mkdir(OUT, { recursive: true });

const today = (d = new Date()) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

// A reader on their ninth day, with three questions put aside and every
// first-run coach mark already read, so the screens show the app at rest
// rather than mid-introduction.
const SETTLED = {
  'lua.hasOpenedBefore': '1',
  'lua.coachSeen': '1',
  'lua.pillIntroSeen': '1',
  'lua.shareCoachSeen': '1',
  'lua.writeIntroSeen': '1',
  'lua.streakCoachSeen': '1',
  'lua.streakDays': '9',
  'lua.streakLastOpen': today(),
  'lua.revealsTotal': '14',
  'lua.saved': JSON.stringify([{ id: 4, done: false }, { id: 16, done: true }, { id: 21, done: false }]),
};

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 402, height: 874, deviceScaleFactor: 2, isMobile: true, hasTouch: false });

async function open(url, storage) {
  await page.goto(`${ORIGIN}/app/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate((s) => { localStorage.clear(); for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v); }, storage);
  await page.goto(`${ORIGIN}${url}`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function shot(name) {
  const png = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: png });
  await sharp(png).webp({ quality: 82 }).toFile(path.join(OUT, `${name}.webp`));
  await sharp(png).avif({ quality: 55, effort: 6 }).toFile(path.join(OUT, `${name}.avif`));
  // Half size for the phone frames on the page, which are never wider than 300px.
  await sharp(png).resize({ width: 402 }).webp({ quality: 82 }).toFile(path.join(OUT, `${name}-sm.webp`));
  await sharp(png).resize({ width: 402 }).avif({ quality: 55, effort: 6 }).toFile(path.join(OUT, `${name}-sm.avif`));
  console.log(`captured ${name}`);
}

// Home at rest: the moon, the idle line, the filters.
await open('/app/', SETTLED);
await sleep(2600);
await shot('home');

// The saved panel, the streak screen and the settings sheet, each from rest.
await page.click('[aria-label^="Saved questions"]');
await sleep(900);
await shot('saved');
await page.keyboard.press('Escape');
await sleep(600);

await open('/app/', SETTLED);
await sleep(1500);
await page.click('[aria-label^="Streak"]');
await sleep(1400);
await shot('streak');

await open('/app/', SETTLED);
await sleep(1500);
await page.click('[aria-label="Settings"]');
await sleep(900);
await shot('settings');

// A question that was sent: the arrival beat, then the question itself.
await open('/app/?p=4', SETTLED);
await sleep(1200);
await shot('arrival');
await page.mouse.click(201, 437);
await sleep(4200);
await shot('reveal');

// The same question in Portuguese, through a Portuguese share link.
await open('/app/q/pt/4', { ...SETTLED, 'lua.lang': 'pt' });
await sleep(1200);
await page.mouse.click(201, 437);
await sleep(4200);
await shot('reveal-pt');

// A firm one, Self, for the weight row.
await open('/app/?p=39', SETTLED);
await sleep(1200);
await page.mouse.click(201, 437);
await sleep(4200);
await shot('reveal-firm');

await browser.close();
