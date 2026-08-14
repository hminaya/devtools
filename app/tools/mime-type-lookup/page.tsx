import type { Metadata } from 'next';
import MimeTypeLookup from '../../../components/tools/MimeTypeLookup/MimeTypeLookup';
import { MIME_ENTRIES } from '../../../utils/mimeTypes';

const COUNT = MIME_ENTRIES.length;

export const metadata: Metadata = {
  title: `MIME Type Lookup - ${COUNT} Content Types by File Extension (Free)`,
  description: `Search ${COUNT} MIME types by file extension, type, or category. Covers images, video, audio, code, fonts, and data. Copy exact Content-Type values. Free.`,
  alternates: {
    canonical: '/tools/mime-type-lookup',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/mime-type-lookup',
    title: 'MIME Type Lookup',
    description: 'Searchable reference of common MIME types and their file extensions.',
    images: [{ url: '/og/tools/mime-type-lookup.png', width: 1200, height: 630, alt: 'MIME Type Lookup tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/mime-type-lookup.png'],
  },
};

export default function MimeTypeLookupPage() {
  return <MimeTypeLookup />;
}