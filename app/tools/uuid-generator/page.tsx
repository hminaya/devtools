import type { Metadata } from 'next';
import UuidGenerator from '../../../components/tools/UuidGenerator/UuidGenerator';

export const metadata: Metadata = {
  title: 'UUID Generator - nil, v1, v2, v3, v4, v5, v6, v7, v8 (RFC 9562)',
  description: 'Generate UUIDs across all RFC 9562 versions: nil, time-based v1/v6/v7, DCE security v2, MD5/SHA name-based v3/v5, random v4, and vendor v8. Batch generate up to 50 at a time.',
  alternates: {
    canonical: '/tools/uuid-generator',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/uuid-generator',
    title: 'UUID Generator - All RFC 9562 Versions',
    description: 'Generate UUIDs in any version (nil, v1-v8) per RFC 9562 with batch support. Free UUID generator.',
    images: [{ url: '/og/tools/uuid-generator.png', width: 1200, height: 630, alt: 'UUID Generator tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/uuid-generator.png'],
  },
};

export default function UuidGeneratorPage() {
  return <UuidGenerator />;
}