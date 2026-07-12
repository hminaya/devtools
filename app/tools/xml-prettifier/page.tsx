import type { Metadata } from 'next';
import XmlPrettifier from '../../../components/tools/XmlPrettifier/XmlPrettifier';

export const metadata: Metadata = {
  title: 'XML/HTML Formatter - Prettify, Minify & Validate',
  description: 'Free online XML and HTML formatter with syntax highlighting. Prettify, validate, beautify, or minify XML and HTML data instantly in your browser. Handles void elements, named entities, and full HTML documents.',
  alternates: {
    canonical: '/tools/xml-prettifier',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/xml-prettifier',
    title: 'XML/HTML Formatter - Free Online Formatter with Syntax Highlighting',
    description: 'Format, validate, beautify, or minify XML and HTML data with syntax highlighting. Free online formatter tool.',
    images: [{ url: '/og/tools/xml-prettifier.png', width: 1200, height: 630, alt: 'XML/HTML Formatter tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/xml-prettifier.png'],
  },
};

export default function XmlPrettifierPage() {
  return <XmlPrettifier />;
}