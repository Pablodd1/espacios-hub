import { useContext } from 'react';
import { LanguageContext } from './language-context';
import type { LanguageContextValue } from './language-context';

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>');
  return ctx;
}
