import { useCallback, useMemo, useState } from 'react';
import { getLang, saveLang, type Lang } from '../lib/i18n';
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
  const [lang, setLangState] = useState<Lang>(() => {
    const initial = getLang();
    if (typeof document !== 'undefined') document.documentElement.lang = htmlLang(initial);
    return initial;
  });

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    saveLang(next);
    if (typeof document !== 'undefined') document.documentElement.lang = htmlLang(next);
  }, []);

  const value = useMemo(() => langValue(lang, setLang), [lang, setLang]);

  return <LangContext value={value}>{children}</LangContext>;
}
