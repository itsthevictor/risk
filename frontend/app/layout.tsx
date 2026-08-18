import type { Metadata } from 'next';
import { Geist, Geist_Mono, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import 'katex/dist/katex.min.css';
import QueryProvider from '@/providers/query-provider';
import Header from '@/components/header';
import Footer from '@/components/footer';

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
  title: 'Risk Analysis Portfolio - VA Demo',
  description:
    'Real time risk analysis tools portfolio - V.A. personal project',
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
    >
      <body className='min-h-full flex flex-col'>
        <Header />
        <QueryProvider>
          <div className='flex flex-col flex-1'>{children}</div>
        </QueryProvider>
        <Footer />
      </body>
    </html>
  );
}
