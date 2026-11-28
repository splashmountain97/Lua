// Three small things: a rule under the header once the page has scrolled,
// sections that rise in as they arrive, and the language offer.
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const top = $('.top');
  const onScroll = () => top && top.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (!reduced && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }, { rootMargin: '0px 0px -10% 0px', threshold: .08 });
    $$('.rise').forEach(el => io.observe(el));
  } else {
    $$('.rise').forEach(el => el.classList.add('in'));
  }

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
