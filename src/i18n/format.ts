/**
 * Espacios Hub — locale-aware formatting helpers (Intl, es-CO / en-US).
 * All functions take an explicit `lang` so they are pure; the `useLanguage()`
 * hook wraps them with the active language.
 */
import type { Lang } from './dict';

const localeOf = (lang: Lang): string => (lang === 'es' ? 'es-CO' : 'en-US');

/**
 * Full-precision COP currency: `$ 1.250.000.000` (es-CO).
 * Use in tables / drawers.
 */
export function formatCOP(value: number, lang: Lang = 'es'): string {
  return new Intl.NumberFormat(localeOf(lang), {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Compact millions display for KPI cards:
 * ES `$1.250 M` · EN `$1,250 M`.
 */
export function formatCOPCompact(value: number, lang: Lang = 'es'): string {
  const millions = value / 1_000_000;
  const formatted = new Intl.NumberFormat(localeOf(lang), {
    maximumFractionDigits: Math.abs(millions) < 10 ? 1 : 0,
  }).format(millions);
  return `$${formatted} M`;
}

/** Locale number: thousands `.` decimal `,` in ES. */
export function formatNumber(value: number, lang: Lang = 'es', digits = 0): string {
  return new Intl.NumberFormat(localeOf(lang), {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

/** Percent: `12,5 %` (ES) / `12.5%` (EN). */
export function formatPercent(value: number, lang: Lang = 'es', digits = 1): string {
  const formatted = new Intl.NumberFormat(localeOf(lang), {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
  return lang === 'es' ? `${formatted} %` : `${formatted}%`;
}

export type DateStyle = 'short' | 'long' | 'day' | 'time';

/**
 * Dates per design.md §8:
 *  - short: `21 jul 2026, 14:32`
 *  - long:  `martes, 21 de julio de 2026` (ES) / `Tuesday, July 21, 2026` (EN)
 *  - day:   `21 jul 2026`
 *  - time:  `14:32`
 */
export function formatDate(date: Date | string | number, lang: Lang = 'es', style: DateStyle = 'short'): string {
  const d = date instanceof Date ? date : new Date(date);
  const locale = localeOf(lang);
  switch (style) {
    case 'long':
      return new Intl.DateTimeFormat(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(d);
    case 'day':
      return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
    case 'time':
      return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hour12: false }).format(d);
    case 'short':
    default: {
      const day = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
      const time = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hour12: false }).format(d);
      return `${day}, ${time}`;
    }
  }
}

/**
 * Relative time for feeds (<24h): `hace 5 min` / `5 min ago`.
 * Falls back to a short date beyond 7 days.
 */
export function formatRelative(date: Date | string | number, lang: Lang = 'es', now: Date = new Date()): string {
  const d = date instanceof Date ? date : new Date(date);
  const diffSec = Math.round((d.getTime() - now.getTime()) / 1000);
  const absSec = Math.abs(diffSec);
  const rtf = new Intl.RelativeTimeFormat(localeOf(lang), { numeric: 'auto' });

  if (absSec < 60) return lang === 'es' ? 'ahora mismo' : 'just now';
  if (absSec < 3600) return rtf.format(Math.trunc(diffSec / 60), 'minute');
  if (absSec < 86400) return rtf.format(Math.trunc(diffSec / 3600), 'hour');
  if (absSec < 86400 * 7) return rtf.format(Math.trunc(diffSec / 86400), 'day');
  return formatDate(d, lang, 'day');
}
