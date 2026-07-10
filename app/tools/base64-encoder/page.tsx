import type { Metadata } from 'next';
import Base64EncoderDecoder from '../../../components/tools/Base64EncoderDecoder/Base64EncoderDecoder';

export const metadata: Metadata = {
  title: 'Base64 Encoder/Decoder - Convert Text & Base64',
  description: 'Encode UTF-8 text as Base64 or decode Base64 back to readable text. Conversion runs locally in your browser.',
  alternates: {
    canonical: '/tools/base64-encoder',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/base64-encoder',
    title: 'Base64 Encoder/Decoder - Free Online Base64 Converter',
    description: 'Encode text to Base64 or decode Base64 to text. Free online Base64 encoder and decoder with UTF-8 support.',
    images: [{ url: '/og/tools/base64-encoder.png', width: 1200, height: 630, alt: 'Base64 Encoder and Decoder tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/base64-encoder.png'],
  },
};

export default function Base64EncoderPage() {
  return <Base64EncoderDecoder />;
}
