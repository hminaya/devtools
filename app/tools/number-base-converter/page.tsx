import type { Metadata } from 'next';
import NumberBaseConverter from '../../../components/tools/NumberBaseConverter/NumberBaseConverter';

export const metadata: Metadata = {
  title: "Number Base Converter - Binary, Octal, Decimal, Hex | DevTools",
  description: "Convert numbers between binary (base 2), octal (base 8), decimal (base 10), and hexadecimal (base 16) with two's complement for signed integers.",
  alternates: {
    canonical: '/tools/number-base-converter',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/number-base-converter',
    title: "Number Base Converter - Binary, Octal, Decimal, Hex | DevTools",
    description: "Convert numbers between binary, octal, decimal, and hexadecimal with two's complement support.",
    images: [{ url: '/og/tools/number-base-converter.png', width: 1200, height: 630, alt: 'Developer Tools Dashboard' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/number-base-converter.png'],
  },
};

export default function NumberBaseConverterPage() {
  return <NumberBaseConverter />;
}
