import type { Metadata, Viewport } from 'next';
import { Geist_Mono, Hanken_Grotesk, Newsreader } from 'next/font/google';
import 'leaflet/dist/leaflet.css';
import './globals.css';
import { QueryProvider } from '@/components/providers/query-provider';
import { LanguageProvider } from '@/lib/i18n/language-context';
import { SiteHeader } from '@/components/layout/site-header';
import { NavRailDesktop } from '@/components/layout/nav-rail-desktop';

const hankenGrotesk = Hanken_Grotesk({
  variable: '--font-hanken-grotesk',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const newsreader = Newsreader({
  variable: '--font-newsreader',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'CR Outdoor Places',
  description: 'Find a place to go outside in Costa Rica.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    title: 'CR Outdoors',
    statusBarStyle: 'default',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#166534',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="es"
      className={`${hankenGrotesk.variable} ${newsreader.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex h-dvh flex-col overflow-hidden lg:flex-row">
        <LanguageProvider>
          <QueryProvider>
            <SiteHeader />
            <NavRailDesktop />
            <div className="min-h-0 flex-1">{children}</div>
          </QueryProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
