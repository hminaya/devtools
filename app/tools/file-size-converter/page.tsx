import type { Metadata } from 'next';
import FileSizeConverter from '../../../components/tools/FileSizeConverter/FileSizeConverter';

export const metadata: Metadata = {
  title: 'File Size Converter - Convert Between B, KB, MB, GB, TB, and Binary Units',
  description: 'Free file size converter tool to convert between bytes, kilobytes, megabytes, gigabytes, terabytes, and binary units (KiB, MiB, GiB, TiB). Supports both decimal (SI) and binary (IEC) standards. Perfect for developers and system administrators.',
  keywords: 'file size converter, bytes to kb, kb to mb, mb to gb, gb to tb, binary units, kibibyte, mebibyte, gibibyte, tebibyte, SI units, IEC units, file size calculator, storage converter',
  openGraph: {
    url: 'https://developers.do/tools/file-size-converter',
    title: 'File Size Converter - Free Decimal & Binary Unit Converter',
    description: 'Convert file sizes between decimal (SI) and binary (IEC) units instantly. Supports B, KB, MB, GB, TB, KiB, MiB, GiB, TiB, and more.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function FileSizeConverterPage() {
  return <FileSizeConverter />;
}
