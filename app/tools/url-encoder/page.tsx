import type { Metadata } from 'next';
import UrlEncoderDecoder from '../../../components/tools/UrlEncoderDecoder/UrlEncoderDecoder';

export const metadata: Metadata = {
  title: 'URL Encoder / Decoder - Encode and Decode URLs Online | DevTools',
  description: 'Encode and decode URLs online using encodeURIComponent and encodeURI. See highlighted differences between the two functions with side-by-side comparison.',
  keywords: 'url encoder, url decoder, urlencode, urldecode, encodeURIComponent, encodeURI, percent encoding, url escape',
  openGraph: {
    url: 'https://developers.do/tools/url-encoder',
    title: 'URL Encoder / Decoder - Encode and Decode URLs Online | DevTools',
    description: 'Encode and decode URLs online using encodeURIComponent and encodeURI with side-by-side comparison.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function UrlEncoderPage() {
  return <UrlEncoderDecoder />;
}
