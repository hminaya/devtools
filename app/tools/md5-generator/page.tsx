import type { Metadata } from 'next';
import MD5Generator from '../../../components/tools/MD5Generator/MD5Generator';

export const metadata: Metadata = {
  title: 'MD5 Hash Generator - Generate MD5 Hashes',
  description: 'Free MD5 hash generator. Create MD5 hashes from text or generate random MD5 hashes with meaningful words. Instant hash generation in your browser.',
  alternates: {
    canonical: '/tools/md5-generator',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/md5-generator',
    title: 'MD5 Hash Generator - Free MD5 Hash Tool',
    description: 'Generate MD5 hashes from text or create random MD5 hashes. Free online MD5 hash generator.',
    images: [{ url: '/og/tools/md5-generator.png', width: 1200, height: 630, alt: 'MD5 Hash tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/md5-generator.png'],
  },
};

export default function MD5GeneratorPage() {
  return <MD5Generator />;
}
