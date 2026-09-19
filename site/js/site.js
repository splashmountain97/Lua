// The site's few moving parts. Everything renders without this file; it only
// adds the typewriter, the scroll-driven push into the visor, the header's
// change of colour over the night sections, and the language offer.
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ── Header: hairline once scrolled, night colours over night sections ──
  const top = $('.top');
  const onScroll = () => top && top.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const menuBtn = $('.menu-btn');
  const menu = $('.menu');
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
  }

  // Which world is under the header decides its colours. Each themed section
  // reports when its top passes the header line.
  if (top && 'IntersectionObserver' in window) {
    const themed = $$('[data-theme-section]');
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) top.dataset.theme = e.target.dataset.themeSection;
      }
    }, { rootMargin: '-64px 0px -85% 0px', threshold: 0 });
    themed.forEach(s => io.observe(s));
  }

  // ── Typewriter, exactly as the app's onboarding does it ─────────────────
  for (const el of $$('[data-type]')) {
    const full = el.textContent;
    if (reduced) continue;
    el.setAttribute('aria-label', full);
    const src = document.createElement('span');
    src.className = 'type-src';
    src.textContent = full;
    const out = document.createElement('span');
    out.setAttribute('aria-hidden', 'true');
    const caret = document.createElement('span');
    caret.className = 'caret';
    caret.setAttribute('aria-hidden', 'true');
    el.textContent = '';
    el.append(src, out, caret);
    let i = 0, timer = 0;
    const finish = () => { clearTimeout(timer); out.textContent = full; caret.classList.add('done'); };
    const step = () => {
      i++;
      out.textContent = full.slice(0, i);
      if (i >= full.length) { caret.classList.add('done'); return; }
      const ch = full[i - 1];
      const extra = '.?!'.includes(ch) ? 430 : ',—;:'.includes(ch) ? 180 : 0;
      timer = setTimeout(step, 34 + extra);
    };
    el.style.cursor = 'pointer';
    el.addEventListener('click', finish, { once: true });
    timer = setTimeout(step, 420);
  }

  // ── Rise in on scroll, once ─────────────────────────────────────────────
  if (!reduced && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }, { rootMargin: '0px 0px -10% 0px', threshold: .08 });
    $$('.rise').forEach(el => io.observe(el));
  } else {
    $$('.rise').forEach(el => el.classList.add('in'));
  }

  // ── The push into the visor ─────────────────────────────────────────────
  // Progress 0→1 across the pinned section, written to a custom property the
  // stylesheet turns into the scale and the fade. The end scale is worked out
  // from the real sizes so the visor fills the viewport on any screen.
  const push = $('.push');
  if (push && !reduced) {
    const cam = $('.push-cam', push);
    const fit = () => {
      const w = cam.offsetWidth, h = cam.offsetHeight;
      const vw = innerWidth, vh = innerHeight;
      // The visor is 19% of the artwork's width and 33% of its height.
      const s = Math.max(vw / (.19 * w), vh / (.33 * h)) * 1.18;
      push.style.setProperty('--smax', (s - 1).toFixed(3));
    };
    let ticking = false;
    const update = () => {
      ticking = false;
      const r = push.getBoundingClientRect();
      const total = push.offsetHeight - innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / total));
      push.style.setProperty('--p', p.toFixed(4));
      // The header changes world with the picture: paper while the drawing
      // is on screen, night once the swirl has taken over.
      if (top && r.top <= 64 && r.bottom >= 64) top.dataset.theme = p > .72 ? 'night' : 'paper';
    };
    const onS = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    addEventListener('scroll', onS, { passive: true });
    addEventListener('resize', () => { fit(); update(); });
    fit(); update();
  }

  // ── Language offer ──────────────────────────────────────────────────────
  // A Portuguese phone on an English page is offered the Portuguese one, once,
  // and never forced. Choosing either way is remembered on this device only.
  const bar = $('.langbar');
  if (bar) {
    const KEY = 'lua.site.lang';
    let stored = null;
    try { stored = localStorage.getItem(KEY); } catch {}
    const here = document.documentElement.lang.startsWith('pt') ? 'pt' : 'en';
    const wants = (navigator.language || '').toLowerCase().startsWith('pt') ? 'pt' : 'en';
    if (!stored && wants !== here) bar.classList.add('show');
    for (const el of $$('[data-lang-choice]')) {
      el.addEventListener('click', () => {
        try { localStorage.setItem(KEY, el.dataset.langChoice); } catch {}
        bar.classList.remove('show');
      });
    }
    for (const el of $$('[data-lang-switch]')) {
      el.addEventListener('click', () => { try { localStorage.setItem(KEY, el.dataset.langSwitch); } catch {} });
    }
  }
})();
