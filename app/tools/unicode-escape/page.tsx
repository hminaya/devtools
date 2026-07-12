import type { Metadata } from 'next';
import UnicodeEscape from '../../../components/tools/UnicodeEscape/UnicodeEscape';

export const metadata: Metadata = {
  title: 'Unicode Escape / Unescape - \\uXXXX and \\u{XXXXX} Converter',
  description: 'Convert text to \\uXXXX and \\u{XXXXX} Unicode escape sequences and back. Handles surrogate pairs, emoji, and standard JSON escapes (\\n, \\t, \\r, \\\\).',
  alternates: {
    canonical: '/tools/unicode-escape',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/unicode-escape',
    title: 'Unicode Escape / Unescape',
    description: 'Convert text to and from \\uXXXX / \\u{XXXXX} Unicode escape sequences with emoji and supplementary plane support.',
    images: [{ url: '/og/tools/unicode-escape.png', width: 1200, height: 630, alt: 'Unicode Escape tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/unicode-escape.png'],
  },
};

export default function UnicodeEscapePage() {
  return <UnicodeEscape />;
}