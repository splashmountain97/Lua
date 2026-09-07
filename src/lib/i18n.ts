/**
 * Two languages, no dependency.
 *
 * English is the source: every string was written in it first, and it is what
 * a reader gets when their device asks for anything else. Portuguese sits
 * beside it rather than underneath — each entry carries both, so a translation
 * is reviewed against the line it replaces instead of against a key in another
 * file, and `Localized` makes a half-translated entry a type error rather than
 * a blank space someone finds in production.
 *
 * The UI chrome lives here. The questions and the idle/settling pools live in
 * data/content.ts, which imports these types — this file imports nothing from
 * it, so the two never form a cycle.
 */

export type Lang = 'en' | 'pt';

/** One string in both languages. Both are required; there is no partial entry. */
export interface Localized { en: string; pt: string }

export const LANGS: { id: Lang; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'pt', label: 'Português' },
];

/** Resolve one entry. The whole runtime cost of this module. */
export const say = (s: Localized, lang: Lang): string => s[lang];

const LANG_KEY = 'lua.lang';

const isLang = (v: unknown): v is Lang => v === 'en' || v === 'pt';

/**
 * What the device asks for, the first time and only the first time.
 *
 * navigator.languages is consulted in order, so a phone set to [pt-BR, en] is
 * Portuguese and one set to [en, pt-BR] is English — the reader's own ranking,
 * not a scan for whether Portuguese appears anywhere in the list. Anything
 * that is not Portuguese lands on English, which is the source language and
 * therefore always complete.
 */
export function detectLang(): Lang {
  const tags = typeof navigator === 'undefined'
    ? []
    : navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const tag of tags) {
    if (!tag) continue;
    const base = tag.toLowerCase().split('-')[0];
    if (base === 'pt') return 'pt';
    if (base === 'en') return 'en';
  }
  return 'en';
}

/**
 * The language a share link was sent in, if the app was opened through one.
 *
 * /q/pt/<id> serves a Portuguese preview and /q/<id> an English one, so the
 * path already says which language the sender was reading in. Anything else
 * on the site says nothing.
 */
export function langFromPath(): Lang | null {
  if (typeof window === 'undefined') return null;
  const path = window.location.pathname;
  if (/^\/q\/pt\/\d+\/?$/.test(path)) return 'pt';
  if (/^\/q\/\d+\/?$/.test(path)) return 'en';
  return null;
}

/**
 * A stored choice outranks everything, always. Someone who picked English on a
 * Portuguese phone means it, and a later visit must not quietly undo them —
 * nor may a link a friend sent them.
 *
 * With no stored choice the link wins over the device, because following a
 * Portuguese link is a better signal about this reader than a phone's locale
 * list: it is the language they were actually just reading. It is not written
 * to storage, so it steers this visit only.
 */
export function getLang(): Lang {
  try {
    const raw = localStorage.getItem(LANG_KEY);
    if (isLang(raw)) return raw;
  } catch { /* private mode */ }
  return langFromPath() ?? detectLang();
}

export function saveLang(lang: Lang) {
  try { localStorage.setItem(LANG_KEY, lang); } catch { /* private mode */ }
}

/** Whether the reader has ever chosen for themselves — see openShared in useLua. */
export function hasChosenLang(): boolean {
  try { return isLang(localStorage.getItem(LANG_KEY)); } catch { return false; }
}
