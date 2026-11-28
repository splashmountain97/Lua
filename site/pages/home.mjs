import { S } from '../strings.mjs';
import { APP_PATH, APP_STORE_URL, PLAY_STORE_URL } from '../config.mjs';
import { esc, picture, phone } from '../layout.mjs';

// Line icons in the drawing's hand: slightly uneven strokes, one weight.
const ICONS = {
  moon: `<svg viewBox="0 0 44 44" aria-hidden="true"><path d="M22.3 5.2c9.6.3 16.6 8.1 16.4 17.2-.2 9.4-8 16.6-17.3 16.4C12.2 38.6 5 30.9 5.3 21.6 5.5 12.4 13 4.9 22.3 5.2z"/><circle cx="27.5" cy="15.8" r="4.6"/><path d="M12.4 26.6c.9-1.4 2.7-1.5 3.6-.1M17 33c.4-1 1.6-1.2 2.2-.3M28.6 30.4c1.1-1.6 3.4-1.7 4.5-.2"/></svg>`,
  notebook: `<svg viewBox="0 0 44 44" aria-hidden="true"><path d="M11.6 8.3c8-.4 14-.4 21.3.2.3 8.6.2 17.6-.3 27.4-7.8.4-13.9.4-21.2-.2-.4-9.1-.3-18 .2-27.4z"/><path d="M9 12.6h4.2M9 18.4h4.2M9 24.3h4.2M9 30.1h4.2M17.6 17.2c4.2-.5 7.3-.6 11.4-.2M17.7 22.4c3.4-.4 6.4-.4 9.1-.1M17.8 27.6c4.8-.5 8.1-.4 11.1-.1"/></svg>`,
  hatch: `<svg viewBox="0 0 44 44" aria-hidden="true"><path d="M8.4 25.2c3.8-2.7 9.6-3.9 13.8-3.9 4.4 0 9.8 1.3 13.6 3.9M6 25.4c5.4 2.6 10.8 3.8 16.2 3.8S33 27.9 38.2 25.3"/><path d="M13.1 24.5c1.1-3.4 4.2-6 8.9-6 4.8 0 8 2.6 9.1 6"/><path d="M22 18.5v-3.2M17.2 19.8l-1.1-2.6M26.8 19.8l1.1-2.6M9.6 35.6c8.4-1.6 16.6-1.6 24.8 0"/></svg>`,
  apple: `<svg viewBox="0 0 26 26" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M17.9 13.6c0-2.6 2.1-3.7 2.2-3.8-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8s2 .8 3.4.8c1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9 0 0-2.7-1-2.7-4.2z"/><path d="M15.4 6.2c.7-.9 1.2-2.1 1.1-3.3-1 0-2.3.7-3 1.6-.7.8-1.3 2-1.1 3.2 1.1.1 2.3-.6 3-1.5z"/></svg>`,
  play: `<svg viewBox="0 0 26 26" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M5.6 3.9c-.4.3-.6.8-.6 1.4v15.4c0 .6.2 1.1.6 1.4l9.3-9.1-9.3-9.1z"/><path d="M5.6 3.9l12.4 7.1-3.1 3-9.3-10.1zM5.6 22.1l12.4-7.1-3.1-3-9.3 10.1z"/><path d="M18 11l3.6 2c.6.3.6 1.1 0 1.4l-3.6 2-3.1-2.7 3.1-2.7z"/></svg>`,
};

// The store badges. A live URL renders a link; an empty one a quiet
// "coming soon", so the page never claims an app that is not there.
export function badges(lang) {
  const t = (p) => p[lang];
  const one = (url, icon, on, name) => url
    ? `<a class="badge" href="${esc(url)}" rel="noopener">${icon}<small>${t(on)}</small><b>${t(name)}</b></a>`
    : `<span class="badge soon">${icon}<small>${t(S.badges.soon)}</small><b>${t(name)}</b></span>`;
  return `<div class="badges">
  ${one(APP_STORE_URL, ICONS.apple, S.badges.on, S.badges.appStore)}
  ${one(PLAY_STORE_URL, ICONS.play, S.badges.onPlay, S.badges.playStore)}
</div>`;
}

export const HERO_SIZES = '(min-width: 900px) 50vw, 100vw';
export const HERO_PRELOAD = `<link rel="preload" as="image" type="image/avif" imagesrcset="${[480, 720, 960, 1536].map(w => `/site/img/ruins-${w}.avif ${w}w`).join(', ')}" imagesizes="${HERO_SIZES}" fetchpriority="high">`;

export default function home({ lang, qr }) {
  const t = (p) => p[lang];
  const H = S.home;
  const live = !!APP_STORE_URL;

  // Until the app is in a store, the primary action is the web app and the
  // badges wait below it. Once it is, the badge leads and the web is the "or".
  const heroActions = live
    ? `${badges(lang)}
    <p class="cta-note"><a href="${APP_PATH}">${t(H.ctaWeb)}</a> · ${t(H.ctaNote)}</p>`
    : `<div class="cta-row"><a class="btn btn-ink" href="${APP_PATH}">${t(H.cta)}</a></div>
    <p class="cta-note">${t(H.ctaNote)}</p>
    ${badges(lang)}`;

  return `
<section class="hero">
  <div class="hero-art">
    ${picture({ name: 'ruins', widths: [480, 720, 960, 1536], sizes: HERO_SIZES, alt: '', eager: true, w: 1536, h: 2752 })}
  </div>
  <div class="hero-copy">
    <p class="kicker">${t(H.kicker)}</p>
    <h1 class="h1">${t(H.h1)}</h1>
    <p class="lead">${t(H.lead)}</p>
    ${heroActions}
  </div>
</section>

<section class="three">
  <div class="wrap three-grid">
    ${H.three.map((x, i) => `<div class="three-item rise">
      ${[ICONS.notebook, ICONS.moon, ICONS.hatch][i]}
      <h2 class="h3">${t(x.head)}</h2>
      <p>${t(x.body)}</p>
    </div>`).join('\n')}
  </div>
</section>

<section class="app" id="app">
  <div class="wrap">
    <p class="kicker">${t(H.app.kicker)}</p>
    <h2 class="h2">${t(H.app.h2)}</h2>
    <div class="shots">
      ${H.app.shots.map(s => `<figure class="shot rise">
        ${phone(s.screen, t(s.alt))}
        <figcaption>${t(s.cap)}</figcaption>
      </figure>`).join('\n')}
    </div>
  </div>
</section>

<section class="why" id="why">
  <div class="wrap why-grid">
    <div class="why-art rise">
      ${picture({ name: 'walking', widths: [480, 720, 960, 1536], sizes: '(min-width: 860px) 42vw, 100vw', alt: '', w: 1536, h: 2752 })}
    </div>
    <div class="rise">
      <p class="kicker">${t(H.why.kicker)}</p>
      <h2 class="h2">${t(H.why.h2)}</h2>
      <p>${t(H.why.p1)}</p>
      <p>${t(H.why.p2)}</p>
      <blockquote class="quote">
        <p>${t(H.why.quote)}</p>
        <cite>${t(H.why.quoteBy)}</cite>
      </blockquote>
      <p class="principle">${t(H.why.principle)}</p>
    </div>
  </div>
</section>

<section class="get" id="get">
  <div class="wrap get-grid">
    <div class="rise">
      <p class="kicker">${t(H.get.kicker)}</p>
      <h2 class="h2">${t(H.get.h2)}</h2>
      <p class="lead">${t(live ? H.get.bodyLive : H.get.bodySoon)}</p>
      ${badges(lang)}
      <div class="cta-row">
        <a class="btn btn-ghost" href="${APP_PATH}">${t(H.get.openWeb)}</a>
      </div>
      <p class="note">${t(H.get.langs)}</p>
    </div>
    <div class="qr rise" role="img" aria-label="${esc(t(H.get.qrAria))}">
      ${qr}
      <span>${t(H.get.qr)}</span>
    </div>
  </div>
</section>`;
}
