'use client';
import { useState } from 'react';
import Link from '@/components/locale-link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { ThemeToggle } from './theme-toggle';
import { LanguageSwitcher } from './language-switcher';
import { stripLocale } from '@/lib/i18n/config';
import { useDictionary } from '@/providers/i18n-provider';
import type { Dictionary } from '@/lib/i18n/dictionaries';

const PATH_LABELS: Record<string, keyof Dictionary['nav']> = {
  '/liquidity': 'liquidity',
  '/market': 'market',
  '/interest-rate': 'interestRate',
  '/credit': 'credit',
};

const isActivePath = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

const Header = () => {
  const pathname = stripLocale(usePathname());
  const dict = useDictionary();
  const currentKey = Object.entries(PATH_LABELS).find(([href]) =>
    isActivePath(pathname, href),
  )?.[1];
  const currentLabel = currentKey ? dict.nav[currentKey] : dict.nav.menu;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='header print:hidden flex flex-row items-center justify-between p-4 border-b border-muted-foreground'>
      <Link href='/' className='text-lg font-bold'>
        RISK
      </Link>
      <div className='flex items-center justify-between gap-x-4'>
        <LanguageSwitcher />
        <div className='md:hidden sm:block'>
          <ThemeToggle />
        </div>

        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger
            render={
              <Button
                variant='outline'
                className='min-w-31 flex justify-between'
              />
            }
          >
            {currentLabel}
            {isOpen ? (
              <IconChevronUp className='ml-2 h-4 w-4' />
            ) : (
              <IconChevronDown className='ml-2 h-4 w-4' />
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <Link
                href='/market'
                className='w-full'
                data-umami-event='header-market-link'
              >
                <DropdownMenuItem>{dict.nav.market}</DropdownMenuItem>
              </Link>
              <Link
                href='/liquidity'
                className='w-full'
                data-umami-event='header-liquidity-link'
              >
                <DropdownMenuItem>{dict.nav.liquidity}</DropdownMenuItem>
              </Link>
              <Link
                href='/interest-rate'
                className='w-full'
                data-umami-event='header-interest-rate-link'
              >
                <DropdownMenuItem>{dict.nav.interestRate}</DropdownMenuItem>
              </Link>
              <Link
                href='/credit'
                className='w-full'
                data-umami-event='header-credit-link'
              >
                <DropdownMenuItem>{dict.nav.credit}</DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />

            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link
                href='/about'
                className='w-full'
                data-umami-event='header-about-link'
              >
                <DropdownMenuItem>{dict.nav.about}</DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
export default Header;
