import type { Metadata } from 'next';
import JsonPrettifier from '../../../components/tools/JsonPrettifier/JsonPrettifier';

export const metadata: Metadata = {
  title: 'JSON Prettifier - Format & Validate JSON',
  description: 'Format, validate, and minify JSON in your browser. Get readable output and actionable syntax errors without uploading your data.',
  alternates: {
    canonical: '/tools/json-prettifier',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/json-prettifier',
    title: 'JSON Prettifier - Free Online JSON Formatter with Syntax Highlighting',
    description: 'Format, validate, and beautify JSON data with syntax highlighting. Free online JSON prettifier tool with minify and validation features.',
    images: [{ url: '/og/tools/json-prettifier.png', width: 1200, height: 630, alt: 'JSON Prettifier tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/json-prettifier.png'],
  },
};

export default function JsonPrettifierPage() {
  return <JsonPrettifier />;
}
