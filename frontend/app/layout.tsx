import type { Metadata } from 'next';
import { Geist, Geist_Mono, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import 'katex/dist/katex.min.css';
import QueryProvider from '@/providers/query-provider';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { ThemeProvider } from '@/providers/theme-provider';
import Script from 'next/script';

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

export const metadata: Metadata = {
  title: 'Portofoliu risc - Victor Alexa',
  description:
    'Portofoliu de tehnici fundamentale de analiză de risc. Proiect personal - Victor A.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang='en'
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
          <Header />
          <QueryProvider>
            <div className='flex flex-col flex-1'>{children}</div>
            {process.env.NODE_ENV === 'production' && (
              <Script
                src='https://analytics.oncaworks.com/script.js'
                data-website-id='2dc0117a-d9fd-4744-b6ba-6fa6df7c506f'
                strategy='afterInteractive'
              />
            )}
          </QueryProvider>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
