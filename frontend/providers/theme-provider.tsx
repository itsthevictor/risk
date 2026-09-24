'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  // The anti-flash script only needs to run on full page loads. When the provider
  // re-mounts client-side (e.g. switching /ro <-> /en re-renders the [lang] root
  // layout), render it as inert text/plain so React doesn't warn about <script>.
  return (
    <NextThemesProvider
      scriptProps={{
        type: typeof window === 'undefined' ? 'text/javascript' : 'text/plain',
      }}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
