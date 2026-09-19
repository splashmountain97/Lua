import { S } from '../strings.mjs';
import { CONTACT_EMAIL, LEGAL_ENTITY_NAME, JURISDICTION } from '../config.mjs';
import { esc } from '../layout.mjs';

const fill = (s) => s
  .replaceAll('LEGAL_ENTITY_NAME', LEGAL_ENTITY_NAME)
  .replaceAll('JURISDICTION', JURISDICTION);

function doc({ lang, kind, effective }) {
  const t = (p) => p[lang];
  const D = S[kind];
  const toc = D.sections.map(s => `<a href="#${s.id}">${t(s.h)}</a>`).join('\n');
  const body = D.sections.map(s => `
<h2 id="${s.id}">${t(s.h)}</h2>
${s.ps.map(p => `<p>${fill(t(p))}</p>`).join('\n')}`).join('\n');
  return `
<section class="paper doc" data-theme-section="paper">
  <div class="wrap doc-grid">
    <aside class="toc"><b>${t(S.legal.contents)}</b>${toc}<a href="#contact">${t(S.legal.contact)}</a></aside>
    <article>
      <h1 class="h1">${t(D.h1)}</h1>
      <p class="meta">${t(S.legal.effective)} ${effective}</p>
      <p class="lead">${t(D.lead)}</p>
      ${body}
      <div class="contact" id="contact">
        <h2>${t(S.legal.contact)}</h2>
        <p>${t(S.legal.contactBody)} <a href="mailto:${esc(CONTACT_EMAIL)}">${esc(CONTACT_EMAIL)}</a>.</p>
      </div>
    </article>
  </div>
</section>`;
}

export const privacy = (ctx) => doc({ ...ctx, kind: 'privacy' });
export const terms = (ctx) => doc({ ...ctx, kind: 'terms' });

export function support({ lang }) {
  const t = (p) => p[lang];
  const D = S.support;
  return `
<section class="paper doc" data-theme-section="paper">
  <div class="wrap doc-grid">
    <aside class="toc"><b>${t(S.legal.contents)}</b>${D.faqs.map(f => `<a href="#${f.id}">${t(f.q)}</a>`).join('\n')}<a href="#contact">${t(S.legal.contact)}</a></aside>
    <article>
      <h1 class="h1">${t(D.h1)}</h1>
      <p class="lead">${t(D.lead)}</p>
      <div class="faq">
        ${D.faqs.map(f => `<details id="${f.id}"><summary>${t(f.q)}</summary><p>${t(f.a)}</p></details>`).join('\n        ')}
      </div>
      <div class="contact" id="contact">
        <h2>${t(S.legal.contact)}</h2>
        <p>${t(S.legal.contactBody)} <a href="mailto:${esc(CONTACT_EMAIL)}">${esc(CONTACT_EMAIL)}</a>.</p>
      </div>
    </article>
  </div>
</section>`;
}
