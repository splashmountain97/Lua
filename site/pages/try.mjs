import { S } from '../strings.mjs';
import { APP_PATH } from '../config.mjs';
import { esc } from '../layout.mjs';

export default function tryPage({ lang, qr }) {
  const t = (p) => p[lang];
  const T = S.tryPage;
  return `
<section class="night deep try" data-theme-section="night">
  <div class="wrap try-grid">
    <div>
      <p class="kicker">${t(T.kicker)}</p>
      <h1 class="h2">${t(T.h1)}</h1>
      <p class="lead try-desk-only">${t(T.desk)}</p>
      <div class="try-mobile try-mobile-only">
        <a class="btn btn-glow" href="${APP_PATH}">${t(T.open)}</a>
      </div>
      <div class="try-desk-only">
        <p class="kicker" style="margin-top:36px">${t(T.orPhone)}</p>
        <div class="qr" style="justify-items:start">${qr}</div>
        <p class="note" style="margin-top:14px"><a href="${APP_PATH}" target="_blank" rel="noopener">${t(T.openNew)}</a></p>
      </div>
      <h2 class="h3" style="margin-top:44px">${t(T.homeHead)}</h2>
      <p>${t(T.homeLead)}</p>
      <div class="steps">
        <div class="step"><b>${t(T.ios)}</b><p>${t(T.iosSteps)}</p></div>
        <div class="step"><b>${t(T.android)}</b><p>${t(T.androidSteps)}</p></div>
      </div>
    </div>
    <div class="try-phone try-desk-only">
      <div class="phone"><div class="phone-screen">
        <iframe src="${APP_PATH}" title="${esc(t(T.frameAria))}" allow="accelerometer; clipboard-write; web-share" loading="lazy"></iframe>
      </div></div>
    </div>
  </div>
</section>`;
}
