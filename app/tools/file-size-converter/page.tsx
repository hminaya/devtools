import type { Metadata } from 'next';
import FileSizeConverter from '../../../components/tools/FileSizeConverter/FileSizeConverter';

export const metadata: Metadata = {
  title: 'File Size Converter - Bytes, KB, MB, GB, TB, KiB & MiB (Free)',
  description: 'Convert between bytes, KB, MB, GB, TB and binary KiB, MiB, GiB, TiB instantly. See why your 1 TB drive shows 931 GB. Free, no signup.',
  alternates: {
    canonical: '/tools/file-size-converter',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/file-size-converter',
    title: 'File Size Converter - Decimal & Binary Storage Units',
    description: 'Convert bytes, KB, MB, GB, TB, KiB, MiB, GiB, and TiB while comparing decimal SI and binary IEC file size units.',
    images: [{ url: '/og/tools/file-size-converter.png', width: 1200, height: 630, alt: 'File Size Converter tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/file-size-converter.png'],
  },
};

export default function FileSizeConverterPage() {
  return <FileSizeConverter />;
}
