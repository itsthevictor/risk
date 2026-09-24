import { lang } from 'next/root-params';
import { notFound } from 'next/navigation';
import { hasLocale, type Locale } from './config';
import type ro from './dictionaries/ro';

// Romanian is the source of truth; en.ts must match its shape.
export type Dictionary = typeof ro;

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  ro: () => import('./dictionaries/ro').then((m) => m.default),
  en: () => import('./dictionaries/en').then((m) => m.default),
};

// Current locale from the [lang] root segment. Server Components only.
export const getLocale = async (): Promise<Locale> => {
  const locale = await lang();
  if (!hasLocale(locale)) notFound();
  return locale;
};

export const getDictionary = async (locale?: Locale) =>
  dictionaries[locale ?? (await getLocale())]();
