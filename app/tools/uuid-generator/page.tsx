import type { Metadata } from 'next';
import UuidGenerator from '../../../components/tools/UuidGenerator/UuidGenerator';

export const metadata: Metadata = {
  title: 'UUID Generator - Generate Random UUIDs (v4)',
  description: 'Generate 1 to 50 random UUID version 4 identifiers with the browser Web Crypto API, then copy the complete list.',
  alternates: {
    canonical: '/tools/uuid-generator',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/uuid-generator',
    title: 'UUID Generator - Free Random UUID (v4) Generator',
    description: 'Generate random version 4 UUIDs instantly. Free UUID generator tool for creating unique identifiers.',
    images: [{ url: '/og/tools/uuid-generator.png', width: 1200, height: 630, alt: 'UUID v4 Generator tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/uuid-generator.png'],
  },
};

export default function UuidGeneratorPage() {
  return <UuidGenerator />;
}
