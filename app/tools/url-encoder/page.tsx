import type { Metadata } from 'next';
import UrlEncoderDecoder from '../../../components/tools/UrlEncoderDecoder/UrlEncoderDecoder';

export const metadata: Metadata = {
  title: 'URL Encoder / Decoder - Encode and Decode URLs Online | DevTools',
  description: 'Encode and decode URLs online using encodeURIComponent and encodeURI. See highlighted differences between the two functions with side-by-side comparison.',
  alternates: {
    canonical: '/tools/url-encoder',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/url-encoder',
    title: 'URL Encoder / Decoder - Encode and Decode URLs Online | DevTools',
    description: 'Encode and decode URLs online using encodeURIComponent and encodeURI with side-by-side comparison.',
    images: [{ url: '/og/tools/url-encoder.png', width: 1200, height: 630, alt: 'Developer Tools Dashboard' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/url-encoder.png'],
  },
};

export default function UrlEncoderPage() {
  return <UrlEncoderDecoder />;
}
