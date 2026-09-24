'use client';

import { createContext, useContext } from 'react';
import { intlLocale, type Locale } from '@/lib/i18n/config';
import { formatRon } from '@/lib/utils';
import type { Dictionary } from '@/lib/i18n/dictionaries';

const I18nContext = createContext<{ locale: Locale; dict: Dictionary } | null>(
  null,
);

export function I18nProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: React.ReactNode;
}) {
  return <I18nContext value={{ locale, dict }}>{children}</I18nContext>;
}

const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
};

// Client Components: current locale and its dictionary.
export const useLocale = () => useI18n().locale;
export const useDictionary = () => useI18n().dict;
// BCP 47 tag for Intl / toLocaleString, e.g. 'ro-RO'.
export const useIntlLocale = () => intlLocale[useI18n().locale];

// formatRon in the current locale: "1.234 RON" (ro) / "RON 1,234" (en).
export const useFormatRon = () => {
  const locale = useIntlLocale();
  return (value: number, maximumFractionDigits?: number) =>
    formatRon(value, maximumFractionDigits, locale);
};
