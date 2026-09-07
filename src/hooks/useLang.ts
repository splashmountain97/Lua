import { createContext, useContext } from 'react';
import { say, type Lang, type Localized } from '../lib/i18n';

/**
 * The chosen language, and the one function that resolves a pair with it.
 *
 * A context rather than a prop: every screen says something, including the
 * four that App renders directly and never hands `lua` to, and threading a
 * language through all of them would put the word `lang` into signatures that
 * are otherwise about the moon.
 */
export interface LangValue {
  lang: Lang;
  setLang: (next: Lang) => void;
  /** Resolve a pair. Named for how it reads at the call site: t(UI.home.close). */
  t: (s: Localized) => string;
}

export const LangContext = createContext<LangValue | null>(null);

export function useLang(): LangValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang called outside LangProvider');
  return ctx;
}

/** Builds the value the provider hands down. Kept here beside its consumers. */
export const langValue = (lang: Lang, setLang: (next: Lang) => void): LangValue =>
  ({ lang, setLang, t: (s: Localized) => say(s, lang) });
