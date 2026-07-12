import type { Metadata } from 'next';
import MimeTypeLookup from '../../../components/tools/MimeTypeLookup/MimeTypeLookup';

export const metadata: Metadata = {
  title: 'MIME Type Lookup - File Extension & Content Type Reference',
  description: 'Search common MIME types by file extension, MIME string, or category. Covers images, video, audio, archives, documents, code, fonts, and data formats.',
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