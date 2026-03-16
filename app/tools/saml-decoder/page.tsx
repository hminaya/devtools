import type { Metadata } from 'next';
import SamlDecoder from '../../../components/tools/SamlDecoder/SamlDecoder';

export const metadata: Metadata = {
  title: 'SAML Decoder - Decode & Inspect SAML Requests/Responses',
  description: 'Free client-side SAML decoder. Decode Base64-encoded SAML Requests and Responses, auto-detect deflate compression, extract key fields like Issuer, NameID, Conditions, and Attributes. All processing happens in your browser.',
  keywords: 'saml decoder, saml response decoder, saml request decoder, saml debugger, saml base64, saml xml, saml inspector, saml tool, sso debugger, how to decode saml response, saml sso debugging, read saml assertion, base64 decode saml',
  openGraph: {
    url: 'https://developers.do/tools/saml-decoder',
    title: 'SAML Decoder - Free SAML Request/Response Inspector',
    description: 'Decode and inspect SAML Requests and Responses. Extract Issuer, NameID, Conditions, Attributes and more. 100% client-side.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function SamlDecoderPage() {
  return <SamlDecoder />;
}
