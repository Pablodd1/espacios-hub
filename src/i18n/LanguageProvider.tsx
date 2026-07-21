import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { getEntry } from './dict';
import type { DictKey, Lang } from './dict';
import {
  formatCOP as fmtCOP,
  formatCOPCompact as fmtCOPCompact,
  formatDate as fmtDate,
  formatNumber as fmtNumber,
  formatPercent as fmtPercent,
  formatRelative as fmtRelative,
} from './format';
import { LanguageContext } from './language-context';
import type { LanguageContextValue } from './language-context';

const STORAGE_KEY = 'espacios-hub-lang';

function readInitialLang(): Lang {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'es' || stored === 'en') return stored;
  } catch {
    /* localStorage unavailable (SSR / privacy mode) */
  }
  return 'es';
}

export default function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readInitialLang);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore persistence errors */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === 'es' ? 'es-CO' : 'en';
  }, [lang]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      setLang,
      t: (key: DictKey) => getEntry(key)[lang],
      formatCOP: (v) => fmtCOP(v, lang),
      formatCOPCompact: (v) => fmtCOPCompact(v, lang),
      formatNumber: (v, digits) => fmtNumber(v, lang, digits),
      formatPercent: (v, digits) => fmtPercent(v, lang, digits),
      formatDate: (d, style) => fmtDate(d, lang, style),
      formatRelative: (d) => fmtRelative(d, lang),
    }),
    [lang, setLang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
