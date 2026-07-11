import type { Metadata } from 'next';
import SHA1Generator from '../../../components/tools/SHA1Generator/SHA1Generator';

export const metadata: Metadata = {
  title: 'SHA-1 Hash Generator - Generate SHA-1 Hashes',
  description: 'Free SHA-1 hash generator. Create SHA-1 hashes from text or generate random SHA-1 hashes with meaningful words. Instant hash generation in your browser.',
  alternates: {
    canonical: '/tools/sha1-generator',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/sha1-generator',
    title: 'SHA-1 Hash Generator - Free SHA-1 Hash Tool',
    description: 'Generate SHA-1 hashes from text or create random SHA-1 hashes. Free online SHA-1 hash generator.',
    images: [{ url: '/og/tools/sha1-generator.png', width: 1200, height: 630, alt: 'SHA-1 Hash tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/sha1-generator.png'],
  },
};

export default function SHA1GeneratorPage() {
  return <SHA1Generator />;
}
