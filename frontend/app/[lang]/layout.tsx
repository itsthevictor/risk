import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ViewTransition } from 'react';
import { Geist, Geist_Mono, JetBrains_Mono } from 'next/font/google';
import '../globals.css';
import { cn } from '@/lib/utils';
import 'katex/dist/katex.min.css';
import QueryProvider from '@/providers/query-provider';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { ThemeProvider } from '@/providers/theme-provider';
import Script from 'next/script';
import CleanUtmUrl from '@/components/clean-utm-url';
import { I18nProvider } from '@/providers/i18n-provider';
import { hasLocale, locales } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getDictionary();
  return {
    title: meta.title,
    description: meta.description,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<'/[lang]'>) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <html
      lang={lang}
      className={cn(
        'h-full',
        'antialiased',
        geistSans.variable,
        geistMono.variable,
        'font-mono',
        jetbrainsMono.variable,
      )}
      suppressHydrationWarning
    >
      <body className='min-h-full flex flex-col'>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
          themes={['light', 'dark']}
        >
          <I18nProvider locale={lang} dict={dict}>
            <CleanUtmUrl />
            <Header />
            <QueryProvider>
              {/* Crossfade only on language switches (see language-switcher.tsx). */}
              <ViewTransition
                default={{ 'language-switch': 'lang-fade', default: 'none' }}
              >
                <div className='flex min-w-0 flex-1 flex-col'>{children}</div>
              </ViewTransition>
              {process.env.NODE_ENV === 'production' && (
                <Script
                  src='https://analytics.oncaworks.com/script.js'
                  data-website-id='2dc0117a-d9fd-4744-b6ba-6fa6df7c506f'
                  strategy='afterInteractive'
                />
              )}
            </QueryProvider>
            <Footer />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
