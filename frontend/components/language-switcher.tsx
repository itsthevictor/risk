'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Switch } from '@/components/ui/switch';
import { LOCALE_COOKIE, localizePath, stripLocale } from '@/lib/i18n/config';
import { cn } from '@/lib/utils';
import { useDictionary, useLocale } from '@/providers/i18n-provider';

// Matches the Switch thumb's transition, so it finishes sliding before the page swaps.
const THUMB_SLIDE_MS = 180;

// RO [switch] EN — checked means English.
export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const dict = useDictionary();
  // Local state so the thumb moves immediately; the header remounts with the
  // new locale after navigation, so this never drifts from the URL.
  const [isEnglish, setIsEnglish] = useState(locale === 'en');

  const switchTo = (checked: boolean) => {
    const target = checked ? 'en' : 'ro';
    if (target === locale) return;
    setIsEnglish(checked);
    document.cookie = `${LOCALE_COOKIE}=${target}; path=/; max-age=31536000; samesite=lax`;

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    setTimeout(
      () =>
        router.push(localizePath(stripLocale(pathname), target), {
          scroll: false,
          // Picked up by the <ViewTransition> in app/[lang]/layout.tsx.
          transitionTypes: ['language-switch'],
        }),
      reduceMotion ? 0 : THUMB_SLIDE_MS,
    );
  };

  const labelClass = (active: boolean) =>
    cn(
      'cursor-pointer text-xs font-medium transition-colors duration-200',
      active ? 'text-foreground' : 'text-muted-foreground',
    );

  return (
    <div className='flex items-center gap-2 cursor-pointer'>
      <span className={labelClass(!isEnglish)} onClick={() => switchTo(false)}>
        RO
      </span>
      <Switch
        size='sm'
        checked={isEnglish}
        onCheckedChange={switchTo}
        aria-label={dict.nav.language}
        data-umami-event={`language-switch-${isEnglish ? 'ro' : 'en'}`}
      />
      <span className={labelClass(isEnglish)} onClick={() => switchTo(true)}>
        EN
      </span>
    </div>
  );
}
