import type { Metadata } from 'next';
import QRCodeGenerator from '../../../components/tools/QRCodeGenerator/QRCodeGenerator';

export const metadata: Metadata = {
  title: 'QR Code Generator - Create Custom QR Codes',
  description: 'Free QR code generator for creating custom QR codes from text, URLs, or any data. Customize colors, size, and error correction level. Download as PNG or copy to clipboard.',
  keywords: 'qr code generator, create qr code, qr code maker, custom qr code, qr code tool, generate qr code, free qr code',
  openGraph: {
    url: 'https://developers.do/tools/qr-code-generator',
    title: 'QR Code Generator - Create Custom QR Codes',
    description: 'Generate custom QR codes instantly. Free QR code generator with customizable colors, sizes, and error correction levels.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function QRCodeGeneratorPage() {
  return <QRCodeGenerator />;
}
