import type { Metadata } from 'next';
import FileSizeConverter from '../../../components/tools/FileSizeConverter/FileSizeConverter';

export const metadata: Metadata = {
  title: 'File Size Converter - Bytes, KB, MB, GB, TB, KiB, MiB & GiB',
  description: 'Convert file sizes between bytes, KB, MB, GB, TB and binary units like KiB, MiB, GiB, and TiB. Compare decimal SI and binary IEC storage values instantly.',
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
