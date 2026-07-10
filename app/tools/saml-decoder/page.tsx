import type { Metadata } from 'next';
import SamlDecoder from '../../../components/tools/SamlDecoder/SamlDecoder';

export const metadata: Metadata = {
  title: 'SAML Decoder - Decode & Inspect SAML Requests/Responses',
  description: 'Decode Base64 SAML Requests and Responses, including Redirect-binding DEFLATE, and inspect key fields locally in your browser.',
  alternates: {
    canonical: '/tools/saml-decoder',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/saml-decoder',
    title: 'SAML Decoder - Free SAML Request/Response Inspector',
    description: 'Decode and inspect SAML Requests and Responses. Extract Issuer, NameID, Conditions, Attributes and more. 100% client-side.',
    images: [{ url: '/og/tools/saml-decoder.png', width: 1200, height: 630, alt: 'SAML Decoder tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/saml-decoder.png'],
  },
};

export default function SamlDecoderPage() {
  return <SamlDecoder />;
}
