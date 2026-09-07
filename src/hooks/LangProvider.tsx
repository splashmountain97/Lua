import { useCallback, useMemo, useState } from 'react';
import { getLangPref, resolveLang, saveLangPref, type Lang, type LangPref } from '../lib/i18n';
import { LangContext, langValue } from './useLang';

/**
 * Holds the language for the whole app and writes a change straight through
 * to storage, so a reload lands on the same one.
 *
 * `document.documentElement.lang` is set here too. It is what a screen reader
 * consults to pick a voice, and index.html can only ever ship one value — so
 * the served markup says English and this corrects it once the reader's own
 * preference is known.
 */
const htmlLang = (lang: Lang) => (lang === 'pt' ? 'pt-BR' : 'en');

export function LangProvider({ children }: { children: React.ReactNode }) {
  // The preference is the state; the language is derived from it. Holding the
  // language instead would lose the difference between following the device
  // and having chosen whatever the device happens to say.
  const [pref, setPrefState] = useState<LangPref>(() => {
    const initial = getLangPref();
    if (typeof document !== 'undefined') document.documentElement.lang = htmlLang(resolveLang(initial));
    return initial;
  });

  const setPref = useCallback((next: LangPref) => {
    setPrefState(next);
    saveLangPref(next);
    if (typeof document !== 'undefined') document.documentElement.lang = htmlLang(resolveLang(next));
  }, []);

  const lang = resolveLang(pref);
  const value = useMemo(() => langValue(lang, pref, setPref), [lang, pref, setPref]);

  return <LangContext value={value}>{children}</LangContext>;
}
