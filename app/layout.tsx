import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import Sidebar from '../components/layouts/Sidebar';
import Analytics from '../components/Analytics';
import CookieConsent from '../components/CookieConsent';
import CookiePreferencesLink from '../components/CookiePreferencesLink';
import { BASE_URL, DEFAULT_OG_IMAGE } from '../config/seo';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: 'developers.do - Free Browser-Based Developer Tools',
  description: 'Free browser-based tools for formatting JSON, testing APIs and regex, decoding SAML and JWTs, generating code, and more. No signup required.',
  authors: [{ name: 'Mushin Code' }],
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    url: '/',
    title: 'developers.do - Free Browser-Based Developer Tools',
    description: 'Free, privacy-focused developer utilities for JSON, APIs, regex, SAML, JWTs, SQL, code generation, and more.',
    siteName: 'developers.do',
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'Developer Tools Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Organization',
                  '@id': `${BASE_URL}/#organization`,
                  name: 'Mushin Code',
                  alternateName: 'developers.do',
                  url: BASE_URL,
                  logo: `${BASE_URL}/favicon.svg`,
                },
                {
                  '@type': 'WebSite',
                  '@id': `${BASE_URL}/#website`,
                  url: BASE_URL,
                  name: 'developers.do',
                  alternateName: 'Developer Tools',
                  description: 'Free developer tools that run locally in your browser',
                  publisher: { '@id': 'https://www.developers.do/#organization' },
                },
              ],
            }),
          }}
        />
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-M9WYKE9S07"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied' });
              var _consent = typeof localStorage !== 'undefined' && localStorage.getItem('cookie_consent');
              if (_consent === 'full') { gtag('consent', 'update', { analytics_storage: 'granted' }); }
              gtag('js', new Date());
              gtag('config', 'G-M9WYKE9S07');
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <Analytics />
        <CookieConsent />
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <div className="min-h-screen lg:flex lg:h-screen">
          <Sidebar />
          <main id="main-content" tabIndex={-1} className="min-w-0 flex-1 bg-slate-50 pt-16 lg:overflow-auto lg:pt-0">
            <div className="min-h-full flex flex-col">
              <div className="flex-1">
                {children}
              </div>
              <footer className="border-t border-slate-200 bg-white/60 px-5 py-6 text-sm text-slate-500 sm:px-8">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2">
                  <span className="font-medium text-slate-700">developers.do</span>
                  <span>© 2026 Mushin Code</span>
                  <Link className="hover:text-slate-900" href="/privacy-policy" prefetch={false}>Privacy</Link>
                  <CookiePreferencesLink />
                  <Link className="hover:text-slate-900" href="/terms-of-use" prefetch={false}>Terms</Link>
                  <a
                    className="hover:text-slate-900"
                    href="https://github.com/hminaya/devtools/blob/main/LICENSE"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    License ↗
                  </a>
                  <a
                    className="ml-auto hover:text-slate-900"
                    href="https://github.com/hminaya/devtools"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Source code ↗
                  </a>
                </div>
              </footer>
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
