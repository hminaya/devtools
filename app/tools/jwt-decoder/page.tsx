import type { Metadata } from 'next';
import JwtDecoder from '../../../components/tools/JwtDecoder/JwtDecoder';

export const metadata: Metadata = {
  title: 'JWT Decoder - Decode & Inspect JWT Tokens',
  description: 'Decode JWT headers, payload claims, timestamps, and signature segments locally in your browser. For inspection only; signatures are not verified.',
  alternates: {
    canonical: '/tools/jwt-decoder',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/jwt-decoder',
    title: 'JWT Decoder - Free JWT Token Inspector & Debugger',
    description: 'Decode and inspect JWT tokens. View headers, payloads, and signatures. Free JWT decoder for debugging and development.',
    images: [{ url: '/og/tools/jwt-decoder.png', width: 1200, height: 630, alt: 'JWT Decoder tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/jwt-decoder.png'],
  },
};

export default function JwtDecoderPage() {
  return <JwtDecoder />;
}
