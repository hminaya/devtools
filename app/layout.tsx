import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import Sidebar from '../components/layouts/Sidebar';
import Analytics from '../components/Analytics';
import CookieConsent from '../components/CookieConsent';
import CookiePreferencesLink from '../components/CookiePreferencesLink';

export const metadata: Metadata = {
  title: 'Developer Tools Dashboard - 14 Free Online Tools for Developers | JSON, API Testing, Code Generators & More',
  description: 'Free online developer tools dashboard featuring essential utilities: AI tokenizers (GPT-4, GPT-3.5), JSON/XML formatters with syntax highlighting, code generators (TypeScript, C#, Swift), API tester, JWT decoder, password generator, UUID generator, Base64 encoder, MD5/SHA-1 hash generators, and Lorem Ipsum generator. All tools run locally in your browser.',
  keywords: 'developer tools, json formatter, json prettifier, xml formatter, xml prettifier, syntax highlighting, json to typescript, json to csharp, json to swift, code generator, api tester, rest api, jwt decoder, jwt token, password generator, secure password, uuid generator, uuid v4, base64 encoder, base64 decoder, md5 hash, md5 generator, sha1 hash, sha-1 generator, lorem ipsum generator, placeholder text, js tokenizer, gpt tokenizer, gpt-4 tokenizer, gpt-3.5 tokenizer, tiktoken, ai tokenizer, token counter, free developer tools, online tools, offline tools, privacy-focused tools, no data collection, web developer utilities, frontend tools, backend tools',
  authors: [{ name: 'Developer Tools Dashboard' }],
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    url: 'https://developers.do',
    title: 'Developer Tools Dashboard - 14 Free Online Tools for Developers',
    description: 'Essential developer utilities: AI tokenizers (GPT-4, GPT-3.5), JSON/XML formatters with syntax highlighting, JSON to TypeScript/C#/Swift converters, API tester, JWT decoder, password & UUID generators, hash tools (MD5, SHA-1), Base64 encoder, and Lorem Ipsum generator. All tools are free and run locally in your browser.',
    siteName: 'Developer Tools Dashboard',
    images: [
      {
        url: 'https://developers.do/favicon.png',
        width: 512,
        height: 512,
        alt: 'Developer Tools Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
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
                  '@id': 'https://developers.do/#organization',
                  name: 'developers.do',
                  url: 'https://developers.do',
                  logo: 'https://developers.do/favicon.png',
                },
                {
                  '@type': 'WebSite',
                  '@id': 'https://developers.do/#website',
                  url: 'https://developers.do',
                  name: 'Developer Tools Dashboard',
                  description: 'Free developer tools that run locally in your browser',
                  publisher: { '@id': 'https://developers.do/#organization' },
                  potentialAction: {
                    '@type': 'SearchAction',
                    target: { '@type': 'EntryPoint', urlTemplate: 'https://developers.do/?q={search_term_string}' },
                    'query-input': 'required name=search_term_string',
                  },
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
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1 bg-slate-50 overflow-auto">
            <div className="min-h-full flex flex-col">
              <div className="flex-1">
                {children}
              </div>
              <footer className="border-t border-slate-200 text-slate-500 text-sm px-8 py-4">
                <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-3">
                  <span>© 2026 Mushin Code</span>
                  <span aria-hidden="true">•</span>
                  <Link className="hover:text-slate-800" href="/privacy-policy">Privacy Policy</Link>
                  <span aria-hidden="true">•</span>
                  <CookiePreferencesLink />
                  <span aria-hidden="true">•</span>
                  <Link className="hover:text-slate-800" href="/terms-of-use">Terms of Use</Link>
                  <span aria-hidden="true">•</span>
                  <a
                    className="hover:text-slate-800"
                    href="https://github.com/hminaya/devtools/blob/main/LICENSE"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    CC BY-NC-SA 4.0
                  </a>
                  <span aria-hidden="true">•</span>
                  <a
                    className="hover:text-slate-800"
                    href="https://github.com/hminaya/devtools"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Source Code
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
