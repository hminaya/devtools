import type { Metadata } from 'next';
import SHA1Generator from '../../../components/tools/SHA1Generator/SHA1Generator';

export const metadata: Metadata = {
  title: 'SHA-1 Hash Generator - Generate SHA-1 Hashes',
  description: 'Free SHA-1 hash generator. Create SHA-1 hashes from text or generate random SHA-1 hashes with meaningful words. Instant hash generation in your browser.',
  keywords: 'sha1 generator, sha-1 hash, sha1 hash generator, generate sha1, sha1 tool, hash generator, sha1 checksum, how to generate sha1 hash, sha-1 checksum online, sha1 from string, what is sha1',
  alternates: {
    canonical: '/tools/sha1-generator',
  },
  openGraph: {
    url: 'https://developers.do/tools/sha1-generator',
    title: 'SHA-1 Hash Generator - Free SHA-1 Hash Tool',
    description: 'Generate SHA-1 hashes from text or create random SHA-1 hashes. Free online SHA-1 hash generator.',
    images: [{ url: '/og/tools/sha1-generator.png', width: 1200, height: 630, alt: 'Developer Tools Dashboard' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/sha1-generator.png'],
  },
};

export default function SHA1GeneratorPage() {
  return <SHA1Generator />;
}
