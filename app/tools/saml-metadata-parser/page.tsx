import type { Metadata } from 'next';
import SamlMetadataParser from '../../../components/tools/SamlMetadataParser/SamlMetadataParser';

export const metadata: Metadata = {
  title: 'SAML Metadata Parser - Inspect IdP/SP XML, Endpoints & Certificates',
  description: 'Parse and validate SAML metadata XML in your browser. Inspect IdP and SP endpoints and certificates, and check for missing fields, duplicate ACS indexes, and expiration.',
  alternates: {
    canonical: '/tools/saml-metadata-parser',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/saml-metadata-parser',
    title: 'SAML Metadata Parser - Free IdP/SP XML Inspector',
    description: 'Inspect SAML metadata XML and extract entity IDs, SSO/ACS endpoints, bindings, certificates, and NameID formats client-side.',
    images: [{ url: '/og/tools/saml-metadata-parser.png', width: 1200, height: 630, alt: 'SAML Metadata Parser tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/saml-metadata-parser.png'],
  },
};

export default function SamlMetadataParserPage() {
  return <SamlMetadataParser />;
}
