// Renders site/og.html to site/img/og.png (1200×630) through the installed
// Chrome, so the preview card is set in the site's real typefaces.
//   node scripts/capture-og.mjs
import puppeteer from 'puppeteer-core';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE = path.join(__dirname, '..', 'site');
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(path.join(SITE, 'og.html')).href, { waitUntil: 'networkidle0' });
await page.evaluate(() => document.fonts.ready);
await new Promise(r => setTimeout(r, 400));
await page.screenshot({ path: path.join(SITE, 'img', 'og.png') });
await browser.close();
console.log('og: site/img/og.png');
