import type { Metadata } from 'next';
import StringEscape from '../../../components/tools/StringEscape/StringEscape';

export const metadata: Metadata = {
  title: 'String Escape / Unescape - JSON, XML, CSV, Regex, Shell',
  description: 'Live escape and unescape text for JSON strings, XML/HTML attributes, CSV fields, regex literals, or POSIX shell contexts. Both directions update from a single input.',
  alternates: {
    canonical: '/tools/string-escape',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/string-escape',
    title: 'String Escape / Unescape - Multi-Context',
    description: 'Escape and unescape strings for JSON, XML, CSV, regex, and shell all in one tool.',
    images: [{ url: '/og/tools/string-escape.png', width: 1200, height: 630, alt: 'String Escape tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/string-escape.png'],
  },
};

export default function StringEscapePage() {
  return <StringEscape />;
}