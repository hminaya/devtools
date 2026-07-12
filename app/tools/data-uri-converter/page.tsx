import type { Metadata } from 'next';
import DataUriConverter from '../../../components/tools/DataUriConverter/DataUriConverter';

export const metadata: Metadata = {
  title: 'Data URI Converter - Encode/Decode data: URIs',
  description: 'Convert text to a data: URI with UTF-8 Base64 encoding, or decode a data: URI back to text or binary bytes. Handles any MIME type and reports size.',
  alternates: {
    canonical: '/tools/data-uri-converter',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/data-uri-converter',
    title: 'Data URI Converter',
    description: 'Encode/decode data: URIs with any MIME type and Base64 / percent-encoded payloads.',
    images: [{ url: '/og/tools/data-uri-converter.png', width: 1200, height: 630, alt: 'Data URI Converter tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/data-uri-converter.png'],
  },
};

export default function DataUriConverterPage() {
  return <DataUriConverter />;
}