import type { Metadata } from 'next';
import UlidGenerator from '../../../components/tools/UlidGenerator/UlidGenerator';

export const metadata: Metadata = {
  title: 'ULID Generator - Sortable Unique Identifiers (Crockford Base32)',
  description: 'Generate ULIDs — 26-character lexicographically sortable identifiers that combine a 48-bit timestamp with 80 bits of crypto-random. Batch generate up to 1000 with optional monotonic mode.',
  alternates: {
    canonical: '/tools/ulid-generator',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/ulid-generator',
    title: 'ULID Generator',
    description: 'Generate sortable ULIDs with monotonic option and batch support.',
    images: [{ url: '/og/tools/ulid-generator.png', width: 1200, height: 630, alt: 'ULID Generator tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/ulid-generator.png'],
  },
};

export default function UlidGeneratorPage() {
  return <UlidGenerator />;
}