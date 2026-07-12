import type { Metadata } from 'next';
import XmlJsonConverter from '../../../components/tools/XmlJsonConverter/XmlJsonConverter';

export const metadata: Metadata = {
  title: 'XML ↔ JSON Converter - Convert XML to JSON and Back',
  description: 'Bidirectional XML-to-JSON and JSON-to-XML converter. Follows the familiar @attr / _text convention, collapses repeated tags into arrays, and round-trips cleanly.',
  alternates: {
    canonical: '/tools/xml-json-converter',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/xml-json-converter',
    title: 'XML ↔ JSON Converter',
    description: 'Convert XML to JSON and JSON to XML with the common @attr/_text convention.',
    images: [{ url: '/og/tools/xml-json-converter.png', width: 1200, height: 630, alt: 'XML ↔ JSON Converter tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/xml-json-converter.png'],
  },
};

export default function XmlJsonConverterPage() {
  return <XmlJsonConverter />;
}