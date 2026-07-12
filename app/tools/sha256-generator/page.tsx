import type { Metadata } from 'next';
import SHA256Generator from '../../../components/tools/SHA256Generator/SHA256Generator';

export const metadata: Metadata = {
  title: 'SHA-256/SHA-384/SHA-512 Hash Generator - Secure Hash Tool',
  description: 'Free SHA-256, SHA-384, and SHA-512 hash generator. Create secure cryptographic hashes from text instantly in your browser. No data sent to servers.',
  alternates: {
    canonical: '/tools/sha256-generator',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/sha256-generator',
    title: 'SHA-256/SHA-384/SHA-512 Hash Generator - Free Secure Hash Tool',
    description: 'Generate SHA-256, SHA-384, and SHA-512 cryptographic hashes from text. Free online secure hash generator.',
    images: [{ url: '/og/tools/sha256-generator.png', width: 1200, height: 630, alt: 'SHA-256/384/512 Hash tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/sha256-generator.png'],
  },
};

export default function SHA256GeneratorPage() {
  return <SHA256Generator />;
}