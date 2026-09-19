// The page shell: head, header, footer. Pages hand in a body and get a
// complete document back, in whichever language they were asked for.
import { S } from './strings.mjs';
import { ORIGIN, APP_PATH, APP_STORE_URL } from './config.mjs';

export const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** The URL of a page in a language: English at the root, Portuguese under /pt/. */
export const href = (path, lang) => (lang === 'pt' ? `/pt${path === '/' ? '/' : path}` : path);

/** Astronaut bust, as AstronautBust.tsx draws it: inverted line work, live swirl in the visor. */
export const bust = () => `
<div class="bust" aria-hidden="true">
  <img src="/site/img/bust-280.jpg" alt="" width="70" height="78" loading="lazy" decoding="async">
  <div class="bust-visor"><img src="/site/img/swirl.webp" alt="" width="60" height="60" loading="lazy" decoding="async"></div>
  <div class="bust-glass"></div>
</div>`;

export function picture({ name, widths, sizes, alt, cls = '', dir = 'img', eager = false, w, h }) {
  const src = (ext) => widths.map(x => `/site/${dir}/${name}-${x}.${ext} ${x}w`).join(', ');
  return `<picture${cls ? ` class="${cls}"` : ''}>
  <source type="image/avif" srcset="${src('avif')}" sizes="${sizes}">
  <source type="image/webp" srcset="${src('webp')}" sizes="${sizes}">
  <img src="/site/${dir}/${name}-${widths[widths.length - 1]}.jpg" srcset="${src('jpg')}" sizes="${sizes}" alt="${esc(alt)}"${w ? ` width="${w}" height="${h}"` : ''}${eager ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"'}>
</picture>`;
}

/** A screenshot of the app, inside the phone frame. */
export function phone(name, alt, { small = false } = {}) {
  return `<div class="phone${small ? ' sm' : ''}"><div class="phone-screen">
  <picture>
    <source type="image/avif" srcset="/site/screens/${name}-sm.avif 402w, /site/screens/${name}.avif 804w" sizes="${small ? '240px' : '(min-width: 860px) 300px, 80vw'}">
    <source type="image/webp" srcset="/site/screens/${name}-sm.webp 402w, /site/screens/${name}.webp 804w" sizes="${small ? '240px' : '(min-width: 860px) 300px, 80vw'}">
    <img src="/site/screens/${name}.png" alt="${esc(alt)}" width="804" height="1748" loading="lazy" decoding="async">
  </picture>
</div></div>`;
}

const FONTS = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Newsreader:wght@300;400&family=Source+Sans+3:wght@400;500&display=swap';

export function shell({ lang, path, title, description, body, css, preload, night = false, jsonLd, noindex = false }) {
  const t = (p) => p[lang];
  const alt = lang === 'pt' ? 'en' : 'pt';
  const canonical = ORIGIN + href(path, lang);
  const nav = [
    ['/#why', S.nav.why], ['/#features', S.nav.features], ['/try', S.nav.tryIt], ['/privacy', S.nav.privacy],
  ];
  const ld = jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : '';
  return `<!doctype html>
<html lang="${lang === 'pt' ? 'pt-BR' : 'en'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="en" href="${ORIGIN + href(path, 'en')}">
<link rel="alternate" hreflang="pt-BR" href="${ORIGIN + href(path, 'pt')}">
<link rel="alternate" hreflang="x-default" href="${ORIGIN + href(path, 'en')}">
${noindex ? '<meta name="robots" content="noindex">' : ''}
<meta name="theme-color" content="${night ? '#0e0f18' : '#F4EFE6'}">
<link rel="icon" type="image/jpeg" href="/app/icon-192.jpg">
<link rel="apple-touch-icon" href="/app/icon-192.jpg">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Lua">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${ORIGIN}/site/img/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="${lang === 'pt' ? 'pt_BR' : 'en_US'}">
<meta name="twitter:card" content="summary_large_image">
${APP_STORE_URL ? `<meta name="apple-itunes-app" content="app-id=${APP_STORE_URL.split('/id')[1] ?? ''}">` : ''}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="${FONTS}" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="${FONTS}"></noscript>
${preload ?? ''}
<style>${css}</style>
${ld}
<script>
// Someone who installed Lua when it lived at / opens here in standalone mode.
// That is the app they want, not this page: send them on, query string intact.
try{if(matchMedia('(display-mode: standalone)').matches||navigator.standalone===true){location.replace('${APP_PATH}'+location.search)}}catch(e){}
</script>
</head>
<body${night ? ' class="night-page"' : ''}>
<a class="skip" href="#main">${t(S.site.skip)}</a>
<div class="langbar" role="region" aria-label="${esc(t(S.site.langOffer))}">
  <span>${t(S.site.langOffer)}</span>
  <a href="${href(path, alt)}" data-lang-choice="${alt}" hreflang="${alt}">${t(S.site.langOfferYes)}</a>
  <button type="button" data-lang-choice="${lang}">${t(S.site.langOfferNo)}</button>
</div>
<header class="top"${night ? ' data-theme="night"' : ''}>
  <div class="wrap top-in">
    <a class="wordmark" href="${href('/', lang)}">Lua</a>
    <nav class="nav" aria-label="Main">
      ${nav.map(([p, l]) => `<a href="${href(p, lang)}">${t(l)}</a>`).join('\n      ')}
      <a class="lang" href="${href(path, alt)}" hreflang="${alt}" lang="${alt === 'pt' ? 'pt-BR' : 'en'}" data-lang-switch="${alt}">${t(S.site.langSwitch)}</a>
      <a class="go" href="${APP_PATH}">${t(S.nav.open)}</a>
    </nav>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu">${t(S.nav.menu)}</button>
  </div>
  <nav class="wrap menu" id="menu" aria-label="Main">
    ${nav.map(([p, l]) => `<a href="${href(p, lang)}">${t(l)}</a>`).join('\n    ')}
    <a href="${href(path, alt)}" hreflang="${alt}" data-lang-switch="${alt}">${t(S.site.langSwitch)}</a>
    <a href="${APP_PATH}">${t(S.nav.open)}</a>
  </nav>
</header>
<main id="main">
${body}
</main>
<footer class="foot night" data-theme-section="night">
  <div class="wrap foot-in">
    ${bust()}
    <div class="foot-links">
      <a href="${href('/privacy', lang)}">${t(S.nav.privacy)}</a>
      <a href="${href('/terms', lang)}">${t(S.nav.terms)}</a>
      <a href="${href('/support', lang)}">${t(S.nav.support)}</a>
      <a href="${APP_PATH}">${t(S.nav.open)}</a>
    </div>
    <p class="foot-made">${t(S.site.madeSlowly)}</p>
  </div>
</footer>
<script>window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};</script>
<script defer src="/_vercel/insights/script.js"></script>
<script src="/site/site.js" defer></script>
</body>
</html>
`;
}
