export const locales = ['ro', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'ro';

// Cookie set by the language switcher; read by proxy.ts on unprefixed URLs.
export const LOCALE_COOKIE = 'NEXT_LOCALE';

export const hasLocale = (value: string | undefined): value is Locale =>
  (locales as readonly string[]).includes(value ?? '');

// BCP 47 tags for Intl / toLocaleString.
export const intlLocale: Record<Locale, string> = {
  ro: 'ro-RO',
  en: 'en-GB',
};

// Prefixes an internal path with the locale: ('/market', 'en') -> '/en/market'.
export const localizePath = (path: string, locale: Locale) =>
  path === '/' ? `/${locale}` : `/${locale}${path}`;

// Removes the locale prefix: '/en/market' -> '/market'.
export const stripLocale = (pathname: string) => {
  const [, first, ...rest] = pathname.split('/');
  return hasLocale(first) ? `/${rest.join('/')}` : pathname;
};

// Fills {placeholders}: fmt('Calculat la {date}', { date: '01.02.2026' }).
// Dictionaries hold plain strings (not functions) because they're passed from
// Server to Client Components.
export const fmt = (
  template: string,
  values: Record<string, string | number>,
) =>
  template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
