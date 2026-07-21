import { createContext } from 'react';
import type { DictKey, Lang } from './dict';
import type { DateStyle } from './format';

export interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Translate a dictionary dot-path key, e.g. `t('nav.dashboard')`. */
  t: (key: DictKey) => string;
  formatCOP: (value: number) => string;
  /** Compact millions: `$1.250 M` (ES) / `$1,250 M` (EN). */
  formatCOPCompact: (value: number) => string;
  formatNumber: (value: number, digits?: number) => string;
  formatPercent: (value: number, digits?: number) => string;
  formatDate: (date: Date | string | number, style?: DateStyle) => string;
  formatRelative: (date: Date | string | number) => string;
}

export const LanguageContext = createContext<LanguageContextValue | null>(null);
