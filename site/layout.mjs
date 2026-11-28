// The page shell: head, header, footer. Pages hand in a body and get a
// complete document back, in whichever language they were asked for.
import { S } from './strings.mjs';
import { ORIGIN, APP_PATH, APP_STORE_URL } from './config.mjs';

export const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** The URL of a page in a language: English at the root, Portuguese under /pt/. */
export const href = (path, lang) => (lang === 'pt' ? `/pt${path === '/' ? '/' : path}` : path);

export function picture({ name, widths, sizes, alt, cls = '', dir = 'img', eager = false, w, h }) {
  const src = (ext) => widths.map(x => `/site/${dir}/${name}-${x}.${ext} ${x}w`).join(', ');
  return `<picture${cls ? ` class="${cls}"` : ''}>
  <source type="image/avif" srcset="${src('avif')}" sizes="${sizes}">
  <source type="image/webp" srcset="${src('webp')}" sizes="${sizes}">
  <img src="/site/${dir}/${name}-${widths[widths.length - 1]}.jpg" srcset="${src('jpg')}" sizes="${sizes}" alt="${esc(alt)}"${w ? ` width="${w}" height="${h}"` : ''}${eager ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"'}>
</picture>`;
}

/** A screenshot of the app, inside the phone frame. Screens are 1320×2868 captures scaled to 804 and 402 wide. */
export function phone(name, alt, sizes = '(min-width: 760px) 280px, 70vw') {
  return `<div class="phone"><div class="phone-screen">
  <picture>
    <source type="image/avif" srcset="/site/screens/${name}-sm.avif 402w, /site/screens/${name}.avif 804w" sizes="${sizes}">
    <source type="image/webp" srcset="/site/screens/${name}-sm.webp 402w, /site/screens/${name}.webp 804w" sizes="${sizes}">
    <img src="/site/screens/${name}.png" alt="${esc(alt)}" width="804" height="1747" loading="lazy" decoding="async">
  </picture>
</div></div>`;
}

const FONTS = 'https://fonts.googleapis.com/css2?family=Newsreader:wght@400&family=Source+Sans+3:wght@400;500&display=swap';

export function shell({ lang, path, title, description, body, css, preload, jsonLd, noindex = false }) {
  const t = (p) => p[lang];
  const alt = lang === 'pt' ? 'en' : 'pt';
  const canonical = ORIGIN + href(path, lang);
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
<meta name="theme-color" content="#F4EFE6">
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
<body>
<a class="skip" href="#main">${t(S.site.skip)}</a>
<div class="langbar" role="region" aria-label="${esc(t(S.site.langOffer))}">
  <span>${t(S.site.langOffer)}</span>
  <a href="${href(path, alt)}" data-lang-choice="${alt}" hreflang="${alt}">${t(S.site.langOfferYes)}</a>
  <button type="button" data-lang-choice="${lang}">${t(S.site.langOfferNo)}</button>
</div>
<header class="top">
  <div class="wrap top-in">
    <a class="wordmark" href="${href('/', lang)}">Lua</a>
    <nav class="nav" aria-label="Main">
      <a class="lang" href="${href(path, alt)}" hreflang="${alt}" lang="${alt === 'pt' ? 'pt-BR' : 'en'}" data-lang-switch="${alt}">${t(S.site.langSwitch)}</a>
      <a class="go" href="${APP_PATH}">${t(S.nav.open)}</a>
    </nav>
  </div>
</header>
<main id="main">
${body}
</main>
<footer class="foot">
  <div class="wrap foot-in">
    <a class="wordmark" href="${href('/', lang)}">Lua</a>
    <div class="foot-links">
      <a href="${href('/privacy', lang)}">${t(S.nav.privacy)}</a>
      <a href="${href('/terms', lang)}">${t(S.nav.terms)}</a>
      <a href="${href('/support', lang)}">${t(S.nav.support)}</a>
      <a href="${href('/try', lang)}">${t(S.nav.tryIt)}</a>
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
