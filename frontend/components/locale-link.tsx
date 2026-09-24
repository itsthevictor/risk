'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { localizePath } from '@/lib/i18n/config';
import { useLocale } from '@/providers/i18n-provider';

// Drop-in replacement for next/link on internal paths: '/market' -> '/en/market'.
export default function LocaleLink({
  href,
  ...props
}: Omit<ComponentProps<typeof Link>, 'href'> & { href: string }) {
  const locale = useLocale();
  const localized = href.startsWith('/') ? localizePath(href, locale) : href;
  return <Link href={localized} {...props} />;
}
