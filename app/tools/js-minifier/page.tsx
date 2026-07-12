import type { Metadata } from 'next';
import JSMinifier from '../../../components/tools/JSMinifier/JSMinifier';

export const metadata: Metadata = {
  title: 'JavaScript Minifier - Strip Comments & Whitespace from JS',
  description: 'Quickly minify JavaScript by removing comments and whitespace while preserving strings, template literals, and regex syntax. No variable renaming — fast cosmetic compression for dev use.',
  alternates: {
    canonical: '/tools/js-minifier',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/js-minifier',
    title: 'JavaScript Minifier',
    description: 'Strip comments and whitespace from JS while preserving strings, templates, and regex literals.',
    images: [{ url: '/og/tools/js-minifier.png', width: 1200, height: 630, alt: 'JavaScript Minifier tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/js-minifier.png'],
  },
};

export default function JSMinifierPage() {
  return <JSMinifier />;
}