import type { Metadata } from 'next';
import QRCodeGenerator from '../../../components/tools/QRCodeGenerator/QRCodeGenerator';

export const metadata: Metadata = {
  title: 'QR Code Generator - Create Custom QR Codes',
  description: 'Free QR code generator for creating custom QR codes from text, URLs, or any data. Customize colors, size, and error correction level. Download as PNG or copy to clipboard.',
  alternates: {
    canonical: '/tools/qr-code-generator',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/qr-code-generator',
    title: 'QR Code Generator - Create Custom QR Codes',
    description: 'Generate custom QR codes instantly. Free QR code generator with customizable colors, sizes, and error correction levels.',
    images: [{ url: '/og/tools/qr-code-generator.png', width: 1200, height: 630, alt: 'Developer Tools Dashboard' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/qr-code-generator.png'],
  },
};

export default function QRCodeGeneratorPage() {
  return <QRCodeGenerator />;
}
