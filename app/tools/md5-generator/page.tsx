import type { Metadata } from 'next';
import MD5Generator from '../../../components/tools/MD5Generator/MD5Generator';

export const metadata: Metadata = {
  title: 'MD5 Hash Generator - Generate MD5 Hashes',
  description: 'Free MD5 hash generator. Create MD5 hashes from text or generate random MD5 hashes with meaningful words. Instant hash generation in your browser.',
  keywords: 'md5 generator, md5 hash, md5 hash generator, generate md5, md5 tool, hash generator, md5 checksum, how to generate md5 hash, md5 hash from string, md5 checksum online, what is md5',
  openGraph: {
    url: 'https://developers.do/tools/md5-generator',
    title: 'MD5 Hash Generator - Free MD5 Hash Tool',
    description: 'Generate MD5 hashes from text or create random MD5 hashes. Free online MD5 hash generator.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function MD5GeneratorPage() {
  return <MD5Generator />;
}
