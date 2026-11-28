// Writes the marketing site into dist/, beside the app that vite has already
// put under dist/app/. Plain files: the pages are rendered here from the
// templates in site/pages, in both languages, and everything else is copied.
//
//   node scripts/build-site.mjs
import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import QRCode from 'qrcode';
import { transformWithOxc } from 'vite';
import { transform as transformCss } from 'lightningcss';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = join(root, 'site');
const DIST = join(root, 'dist');

const { shell } = await import('../site/layout.mjs');
const { S } = await import('../site/strings.mjs');
const { ORIGIN, APP_PATH, BUNDLE_ID } = await import('../site/config.mjs');
const homeMod = await import('../site/pages/home.mjs');
const home = homeMod.default;
const tryPage = (await import('../site/pages/try.mjs')).default;
const { privacy, terms, support } = await import('../site/pages/legal.mjs');

// Everything at the root of dist except the app is this script's, and stale
// files from a previous build must not survive into the deploy.
await mkdir(DIST, { recursive: true });
for (const name of await readdir(DIST)) {
  if (name !== 'app') await rm(join(DIST, name), { recursive: true, force: true });
}

// Static files.
await mkdir(join(DIST, 'site'), { recursive: true });
// The stylesheet goes inline into every page (one request fewer before the
// first paint; it is small); the script is a file, deferred.
const css = transformCss({ filename: 'site.css', code: await readFile(join(SITE, 'css/site.css')), minify: true }).code.toString().trim();
const js = (await transformWithOxc(await readFile(join(SITE, 'js/site.js'), 'utf8'), 'site.js', { minify: true })).code;
await writeFile(join(DIST, 'site/site.js'), js);
await cp(join(SITE, 'img'), join(DIST, 'site/img'), { recursive: true });
await cp(join(SITE, 'screens'), join(DIST, 'site/screens'), { recursive: true });
await cp(join(SITE, 'well-known'), join(DIST, '.well-known'), { recursive: true });

// The QR points at the app, as an SVG drawn here rather than fetched from
// anyone's service.
const qr = (await QRCode.toString(`${ORIGIN}${APP_PATH}`, { type: 'svg', margin: 0, color: { dark: '#2A2724', light: '#00000000' } }))
  .replace('<svg ', '<svg aria-hidden="true" focusable="false" ');

const effective = new Date().toISOString().slice(0, 10);
const jsonLd = (lang) => ({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Lua',
  description: S.site.description[lang],
  url: ORIGIN,
  image: `${ORIGIN}/site/img/og.png`,
  applicationCategory: 'LifestyleApplication',
  operatingSystem: 'iOS, Android, Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  inLanguage: ['en', 'pt-BR'],
});

const PAGES = [
  { path: '/', title: S.home.title, description: S.site.description, render: home, ld: true, preload: homeMod.HERO_PRELOAD },
  { path: '/try', title: S.tryPage.title, description: S.tryPage.description, render: tryPage },
  { path: '/privacy', title: S.privacy.title, description: S.privacy.description, render: privacy },
  { path: '/terms', title: S.terms.title, description: S.terms.description, render: terms },
  { path: '/support', title: S.support.title, description: S.support.description, render: support },
];

const urls = [];
for (const lang of ['en', 'pt']) {
  for (const p of PAGES) {
    const body = p.render({ lang, qr, effective });
    const html = shell({
      lang, path: p.path, title: p.title[lang], description: p.description[lang], body, css, preload: p.preload,
      jsonLd: p.ld ? jsonLd(lang) : undefined,
    });
    const rel = (lang === 'pt' ? 'pt' : '') + (p.path === '/' ? '' : p.path);
    const dir = join(DIST, rel);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'index.html'), html);
    urls.push(`${ORIGIN}${lang === 'pt' ? '/pt' : ''}${p.path === '/' ? '/' : p.path}`);
  }
}

await writeFile(join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map(u => `  <url><loc>${u}</loc></url>`).join('\n') + `\n  <url><loc>${ORIGIN}${APP_PATH}</loc></url>\n</urlset>\n`);
await writeFile(join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${ORIGIN}/sitemap.xml\n`);

// The worker that used to own scope / precached the old app there. A worker
// at the same URL that unregisters itself is how the browser is told to let
// go: it installs over the old one, drops the registration, and reloads its
// pages onto the live site — which then sends installed apps on to /app/.
await writeFile(join(DIST, 'sw.js'), `// Lua once lived at /. This worker retires the one that cached it there.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(
  self.registration.unregister()
    .then(() => self.clients.matchAll({ type: 'window' }))
    .then((cs) => { for (const c of cs) c.navigate(c.url); })
));
`);

console.log(`site: ${urls.length} pages written to dist/`);
