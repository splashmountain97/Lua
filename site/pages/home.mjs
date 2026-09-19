import { S } from '../strings.mjs';
import { APP_PATH, APP_STORE_URL, PLAY_STORE_URL } from '../config.mjs';
import { esc, href, picture, phone } from '../layout.mjs';
import { CATS, WEIGHT_NAME } from '../content.mjs';

// Line icons in the drawing's hand: slightly uneven strokes, one weight.
const ICONS = {
  moon: `<svg viewBox="0 0 44 44" aria-hidden="true"><path d="M22.3 5.2c9.6.3 16.6 8.1 16.4 17.2-.2 9.4-8 16.6-17.3 16.4C12.2 38.6 5 30.9 5.3 21.6 5.5 12.4 13 4.9 22.3 5.2z"/><circle cx="27.5" cy="15.8" r="4.6"/><path d="M12.4 26.6c.9-1.4 2.7-1.5 3.6-.1M17 33c.4-1 1.6-1.2 2.2-.3M28.6 30.4c1.1-1.6 3.4-1.7 4.5-.2"/></svg>`,
  notebook: `<svg viewBox="0 0 44 44" aria-hidden="true"><path d="M11.6 8.3c8-.4 14-.4 21.3.2.3 8.6.2 17.6-.3 27.4-7.8.4-13.9.4-21.2-.2-.4-9.1-.3-18 .2-27.4z"/><path d="M9 12.6h4.2M9 18.4h4.2M9 24.3h4.2M9 30.1h4.2M17.6 17.2c4.2-.5 7.3-.6 11.4-.2M17.7 22.4c3.4-.4 6.4-.4 9.1-.1M17.8 27.6c4.8-.5 8.1-.4 11.1-.1"/></svg>`,
  hatch: `<svg viewBox="0 0 44 44" aria-hidden="true"><path d="M8.4 25.2c3.8-2.7 9.6-3.9 13.8-3.9 4.4 0 9.8 1.3 13.6 3.9M6 25.4c5.4 2.6 10.8 3.8 16.2 3.8S33 27.9 38.2 25.3"/><path d="M13.1 24.5c1.1-3.4 4.2-6 8.9-6 4.8 0 8 2.6 9.1 6"/><path d="M22 18.5v-3.2M17.2 19.8l-1.1-2.6M26.8 19.8l1.1-2.6M9.6 35.6c8.4-1.6 16.6-1.6 24.8 0"/></svg>`,
  apple: `<svg viewBox="0 0 26 26" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M17.9 13.6c0-2.6 2.1-3.7 2.2-3.8-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8s2 .8 3.4.8c1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9 0 0-2.7-1-2.7-4.2z"/><path d="M15.4 6.2c.7-.9 1.2-2.1 1.1-3.3-1 0-2.3.7-3 1.6-.7.8-1.3 2-1.1 3.2 1.1.1 2.3-.6 3-1.5z"/></svg>`,
  play: `<svg viewBox="0 0 26 26" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M5.6 3.9c-.4.3-.6.8-.6 1.4v15.4c0 .6.2 1.1.6 1.4l9.3-9.1-9.3-9.1z"/><path d="M5.6 3.9l12.4 7.1-3.1 3-9.3-10.1zM5.6 22.1l12.4-7.1-3.1-3-9.3 10.1z"/><path d="M18 11l3.6 2c.6.3.6 1.1 0 1.4l-3.6 2-3.1-2.7 3.1-2.7z"/></svg>`,
};

const COLUMNS = `<svg viewBox="0 0 220 44" aria-hidden="true">
<path d="M6 40.5c34-1.2 68-1.4 104-1.1 36 .2 70 .4 104 1.3"/>
<g>
 <path d="M24 12.6h14M25.5 12.6l-.9 24.6M36.6 12.6l1 24.5M23 37.4h16M25 10.3h12"/>
 <path d="M28.5 15c-.3 7-.4 14-.2 20M32.4 15c.2 6.8.3 13.8.1 20.3"/>
</g>
<g transform="translate(46,0)"><path d="M24 12.6h14M25.5 12.6l-.9 24.6M36.6 12.6l1 24.5M23 37.4h16M25 10.3h12"/><path d="M28.5 15c-.3 7-.4 14-.2 20M32.4 15c.2 6.8.3 13.8.1 20.3"/></g>
<g transform="translate(92,0)"><path d="M24 12.6h14M25.5 12.6l-.9 24.6M36.6 12.6l1 24.5M23 37.4h16M25 10.3h12"/><path d="M28.5 15c-.3 7-.4 14-.2 20M32.4 15c.2 6.8.3 13.8.1 20.3"/></g>
<g transform="translate(138,0)"><path d="M24 12.6h14M25.5 12.6l-.9 24.6M36.6 12.6l1 24.5M23 37.4h16M25 10.3h12"/><path d="M28.5 15c-.3 7-.4 14-.2 20M32.4 15c.2 6.8.3 13.8.1 20.3"/></g>
<path d="M188 20.6c2.6-.3 5.2-.3 7.8 0M189.2 20.6l-.4 16.9M195.3 20.6l.5 16.8"/>
</svg>`;

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
  const [f1, f2, f3, f4] = H.features;
  const cats = CATS.map(c => `<li><b>${t(c.label)}</b> <span>${t(c.desc)}</span></li>`).join('\n');
  const weights = [1, 2, 3].map(w => t(WEIGHT_NAME[w])).join(' · ');

  return `
<section class="paper hero" data-theme-section="paper">
  <div class="hero-art">
    ${picture({ name: 'ruins', widths: [480, 720, 960, 1536], sizes: HERO_SIZES, alt: '', eager: true, w: 1536, h: 2752 })}
  </div>
  <div class="hero-copy">
    <p class="kicker">${t(H.kicker)}</p>
    <h1 class="h1" data-type>${t(H.h1)}</h1>
    <p class="lead">${t(H.lead)}</p>
    <div class="cta-row">
      <a class="btn btn-ink" href="${APP_PATH}">${t(H.cta)}</a>
      <a class="btn btn-ghost" href="#why">${t(S.nav.why)}</a>
    </div>
    <p class="cta-note">${t(H.ctaNote)}</p>
    ${badges(lang)}
  </div>
</section>

<section class="paper three" aria-label="${esc(t(S.nav.features))}">
  <div class="wrap three-grid">
    ${H.three.map((x, i) => `<div class="three-item rise">
      ${[ICONS.moon, ICONS.notebook, ICONS.hatch][i]}
      <h2 class="h3">${t(x.head)}</h2>
      <p>${t(x.body)}</p>
    </div>`).join('\n')}
  </div>
  <div class="rule">${COLUMNS}</div>
</section>

<section class="paper why" id="why">
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
    </div>
  </div>
</section>

<section class="push" aria-hidden="true">
  <div class="push-stage">
    <div class="push-cam">
      ${picture({ name: 'helmet', widths: [960, 1400, 1800, 2400], sizes: 'max(112vw, 225vh)', alt: '', w: 2816, h: 1536 })}
      <div class="visor"><img src="/site/img/swirl.webp" alt="" width="380" height="380" loading="lazy" decoding="async"></div>
      <div class="visor-glass"></div>
    </div>
    <div class="push-night"></div>
    <p class="push-line">${t(H.push.line)}</p>
    <p class="push-hint">↓</p>
  </div>
</section>

<section class="night deep inside" id="features" data-theme-section="night">
  <div class="wrap">
    <p class="kicker">${t(H.inside.kicker)}</p>
    <h2 class="h2">${t(H.inside.h2)}</h2>
    <p class="lead">${t(H.inside.lead)}</p>
    <div class="moon-wrap" role="img" aria-label="${esc(t(H.inside.moonAria))}">
      <div class="moon-ground"></div>
      <div class="moon">
        <img class="moon-body" src="/site/img/moon.webp" alt="" width="480" height="480" loading="lazy" decoding="async">
        <div class="moon-window">
          <img src="/site/img/swirl.webp" alt="" width="380" height="380" loading="lazy" decoding="async">
          <img class="rev" src="/site/img/swirl.webp" alt="" width="380" height="380" loading="lazy" decoding="async">
        </div>
        <div class="moon-glass"></div>
      </div>
    </div>
  </div>
</section>

<section class="night features">
  <div class="wrap">
    <article class="feature">
      <div class="feature-copy rise">
        <p class="kicker">${t(f1.kicker)}</p>
        <h3 class="h2">${t(f1.head)}</h3>
        <p>${t(f1.body)}</p>
        <p class="note">${t(f1.note)}</p>
      </div>
      <div class="feature-art rise">${phone(f1.screen, t(f1.alt))}</div>
    </article>

    <article class="feature flip">
      <div class="feature-copy rise">
        <p class="kicker">${t(f2.kicker)}</p>
        <h3 class="h2">${t(f2.head)}</h3>
        <p>${t(f2.body)}</p>
        <ul class="cats">
          ${cats}
        </ul>
        <p class="note"><b>${weights}</b></p>
        <p class="note">${t(f2.note)}</p>
      </div>
      <div class="feature-art rise">${phone(f2.screen, t(f2.alt))}</div>
    </article>

    <article class="feature">
      <div class="feature-copy rise">
        <p class="kicker">${t(f3.kicker)}</p>
        <h3 class="h2">${t(f3.head)}</h3>
        <p>${t(f3.body)}</p>
      </div>
      <div class="feature-art rise">${phone(f3.screen, t(f3.alt))}</div>
    </article>

    <article class="feature flip">
      <div class="feature-copy rise">
        <p class="kicker">${t(f4.kicker)}</p>
        <h3 class="h2">${t(f4.head)}</h3>
        <p>${t(f4.body)}</p>
      </div>
      <div class="feature-art rise">${phone(f4.screen, t(f4.alt))}</div>
    </article>
  </div>
</section>

<section class="paper write" data-theme-section="paper">
  <div class="wrap write-grid">
    <div class="rise">
      <p class="kicker">${t(H.write.kicker)}</p>
      <h2 class="h2">${t(H.write.h2)}</h2>
      <p>${t(H.write.p1)}</p>
      <p><b>${t(H.write.p2)}</b></p>
    </div>
    <div class="feature-art rise">${phone('saved', t(H.write.alt))}</div>
  </div>
</section>

<section class="night langs" data-theme-section="night">
  <div class="wrap">
    <p class="kicker">${t(H.langs.kicker)}</p>
    <h2 class="h2">${t(H.langs.h2)}</h2>
    <p class="lead">${t(H.langs.body)}</p>
    <div class="langs-pair">
      <figure class="rise">${phone('reveal', t(H.langs.altEn), { small: true })}<figcaption>English</figcaption></figure>
      <figure class="rise">${phone('reveal-pt', t(H.langs.altPt), { small: true })}<figcaption>Português</figcaption></figure>
    </div>
  </div>
</section>

<section class="night deep get" id="get">
  <div class="wrap get-grid">
    <div class="rise">
      <p class="kicker">${t(H.get.kicker)}</p>
      <h2 class="h2">${t(H.get.h2)}</h2>
      <p class="lead">${t(H.get.body)}</p>
      <div class="cta-row">
        <a class="btn btn-glow" href="${APP_PATH}">${t(H.get.openWeb)}</a>
        <a class="btn btn-night-ghost" href="${href('/try', lang)}">${t(S.nav.tryIt)}</a>
      </div>
      ${badges(lang)}
    </div>
    <div class="qr rise" role="img" aria-label="${esc(t(H.get.qrAria))}">
      ${qr}
      <span>${t(H.get.qr)}</span>
    </div>
  </div>
</section>`;
}
