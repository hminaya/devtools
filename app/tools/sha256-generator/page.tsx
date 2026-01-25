import type { Metadata } from 'next';
import SHA256Generator from '../../../components/tools/SHA256Generator/SHA256Generator';

export const metadata: Metadata = {
  title: 'SHA-256/SHA-512 Hash Generator - Secure Hash Tool',
  description: 'Free SHA-256 and SHA-512 hash generator. Create secure cryptographic hashes from text instantly in your browser. No data sent to servers.',
  keywords: 'sha256 generator, sha-256 hash, sha512 generator, sha-512 hash, secure hash, cryptographic hash, hash generator, sha256 tool, sha512 tool',
  openGraph: {
    url: 'https://developers.do/tools/sha256-generator',
    title: 'SHA-256/SHA-512 Hash Generator - Free Secure Hash Tool',
    description: 'Generate SHA-256 and SHA-512 cryptographic hashes from text. Free online secure hash generator.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function SHA256GeneratorPage() {
  return <SHA256Generator />;
}
