import type { Metadata } from 'next';
import XmlPrettifier from '../../../components/tools/XmlPrettifier/XmlPrettifier';

export const metadata: Metadata = {
  title: 'XML Prettifier - Format & Validate XML',
  description: 'Free online XML formatter with syntax highlighting. Format, validate, and beautify XML data instantly. Supports XML prettifying and syntax validation. All processing happens in your browser.',
  keywords: 'xml formatter, xml prettifier, xml validator, xml beautifier, format xml, validate xml, xml syntax highlighting, online xml tool, free xml formatter, how to format xml, xml formatter online, xml beautifier free, fix xml errors, validate xml online',
  openGraph: {
    url: 'https://developers.do/tools/xml-prettifier',
    title: 'XML Prettifier - Free Online XML Formatter with Syntax Highlighting',
    description: 'Format, validate, and beautify XML data with syntax highlighting. Free online XML prettifier tool with validation features.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function XmlPrettifierPage() {
  return <XmlPrettifier />;
}
