import type { Metadata } from 'next';
import CSSFormatter from '../../../components/tools/CSSFormatter/CSSFormatter';

export const metadata: Metadata = {
  title: 'CSS Minifier / Beautifier - Compress and Format CSS Online',
  description: 'Minify CSS by stripping comments and whitespace, or beautify minified CSS with re-indentation. Preserves spaces inside parenthesised values like rgba() and calc().',
  alternates: {
    canonical: '/tools/css-formatter',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/css-formatter',
    title: 'CSS Minifier / Beautifier',
    description: 'Compress and format CSS in your browser with simultaneous minified and beautified outputs.',
    images: [{ url: '/og/tools/css-formatter.png', width: 1200, height: 630, alt: 'CSS Formatter tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/css-formatter.png'],
  },
};

export default function CSSFormatterPage() {
  return <CSSFormatter />;
}