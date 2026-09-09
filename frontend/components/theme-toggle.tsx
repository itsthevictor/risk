'use client';

import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import { IconBrightness } from '@tabler/icons-react';

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      variant='ghost'
      size='icon'
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className='bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent hover:dark:bg-transparent focus:dark:bg-transparent active:dark:bg-transparent cursor-pointer'
      data-umami-event='theme-toggle-click'
    >
      <IconBrightness />
    </Button>
  );
}
