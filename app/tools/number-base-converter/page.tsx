import type { Metadata } from 'next';
import NumberBaseConverter from '../../../components/tools/NumberBaseConverter/NumberBaseConverter';

export const metadata: Metadata = {
  title: "Number Base Converter - Binary, Octal, Decimal, Hex | DevTools",
  description: "Convert numbers between binary (base 2), octal (base 8), decimal (base 10), and hexadecimal (base 16) with two's complement for signed integers.",
  keywords: "number base converter, binary to decimal, hex to decimal, decimal to binary, binary to hex, octal converter, twos complement, base conversion",
  openGraph: {
    url: 'https://developers.do/tools/number-base-converter',
    title: "Number Base Converter - Binary, Octal, Decimal, Hex | DevTools",
    description: "Convert numbers between binary, octal, decimal, and hexadecimal with two's complement support.",
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function NumberBaseConverterPage() {
  return <NumberBaseConverter />;
}
