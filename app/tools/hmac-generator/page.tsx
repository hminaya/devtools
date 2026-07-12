import type { Metadata } from 'next';
import HmacGenerator from '../../../components/tools/HmacGenerator/HmacGenerator';

export const metadata: Metadata = {
  title: 'HMAC Generator - HMAC-SHA1, SHA-256, SHA-384, SHA-512',
  description: 'Generate HMAC signatures with SHA-1, SHA-256, SHA-384, or SHA-512. Compute locally in your browser via Web Crypto and copy the hex, base64, or base64url output.',
  alternates: {
    canonical: '/tools/hmac-generator',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/hmac-generator',
    title: 'HMAC Generator - SHA-1 / SHA-256 / SHA-384 / SHA-512',
    description: 'Generate HMAC signatures locally in your browser using Web Crypto.',
    images: [{ url: '/og/tools/hmac-generator.png', width: 1200, height: 630, alt: 'HMAC Generator tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/hmac-generator.png'],
  },
};

export default function HmacGeneratorPage() {
  return <HmacGenerator />;
}