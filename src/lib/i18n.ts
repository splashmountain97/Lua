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

/**
 * What is stored, which is not the same as what is rendered.
 *
 * 'system' is a real, selectable state rather than the absence of one: without
 * it there is no way back to following the device once someone has overridden
 * it, and "unset" is not something a settings row can offer. It is represented
 * by the absence of the key, so a reader who has never chosen is already on it.
 */
export type LangPref = 'system' | Lang;

/** One string in both languages. Both are required; there is no partial entry. */
export interface Localized { en: string; pt: string }

/**
 * The languages, named in themselves. 'English' is always "English" and
 * 'Português' always "Português", never "Portuguese" — a language name is not
 * UI copy and does not translate. `note` is the region it is written for, as
 * text: a flag would be a country, and Português is spoken in several.
 */
export const LANGS: { id: Lang; label: string; note?: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'pt', label: 'Português', note: 'Brasil' },
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
  return resolveLang(getLangPref());
}

/** The stored choice, or 'system' when there has never been one. */
export function getLangPref(): LangPref {
  try {
    const raw = localStorage.getItem(LANG_KEY);
    if (isLang(raw)) return raw;
  } catch { /* private mode */ }
  return 'system';
}

/**
 * A preference as an actual language to render in. Only 'system' consults the
 * link and the device; a stored choice is returned untouched, which is what
 * makes it outrank both.
 */
export function resolveLang(pref: LangPref): Lang {
  return pref === 'system' ? langFromPath() ?? detectLang() : pref;
}

export function saveLang(lang: Lang) {
  try { localStorage.setItem(LANG_KEY, lang); } catch { /* private mode */ }
}

/**
 * Back to following the device. The key is removed rather than set to a
 * sentinel, so 'system' stays the one state that is written down nowhere and
 * a reader who has never chosen is indistinguishable from one who chose it.
 */
export function clearLang() {
  try { localStorage.removeItem(LANG_KEY); } catch { /* private mode */ }
}

/** Store a preference, whichever of the three it is. */
export function saveLangPref(pref: LangPref) {
  if (pref === 'system') clearLang();
  else saveLang(pref);
}

/** Whether the reader has ever chosen for themselves — see openShared in useLua. */
export function hasChosenLang(): boolean {
  return getLangPref() !== 'system';
}
