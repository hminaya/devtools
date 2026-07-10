import type { Metadata } from 'next';
import XmlPrettifier from '../../../components/tools/XmlPrettifier/XmlPrettifier';

export const metadata: Metadata = {
  title: 'XML Prettifier - Format & Validate XML',
  description: 'Free online XML formatter with syntax highlighting. Format, validate, and beautify XML data instantly. Supports XML prettifying and syntax validation. All processing happens in your browser.',
  alternates: {
    canonical: '/tools/xml-prettifier',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/xml-prettifier',
    title: 'XML Prettifier - Free Online XML Formatter with Syntax Highlighting',
    description: 'Format, validate, and beautify XML data with syntax highlighting. Free online XML prettifier tool with validation features.',
    images: [{ url: '/og/tools/xml-prettifier.png', width: 1200, height: 630, alt: 'Developer Tools Dashboard' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/xml-prettifier.png'],
  },
};

export default function XmlPrettifierPage() {
  return <XmlPrettifier />;
}
