import type { Metadata } from 'next';
import SamlMetadataParser from '../../../components/tools/SamlMetadataParser/SamlMetadataParser';

export const metadata: Metadata = {
  title: 'SAML Metadata Parser - Parse & Inspect SAML Metadata XML',
  description: 'Free client-side SAML metadata parser. Extract Entity ID, SSO/ACS endpoints, X.509 certificates, NameID formats, and organization info from SAML metadata XML. Works with Okta, Azure AD, ADFS, and more.',
  keywords: 'saml metadata parser, saml metadata inspector, saml idp metadata, saml sp metadata, saml endpoints, saml certificate, sso metadata, okta metadata, azure ad metadata, how to parse saml metadata, read idp metadata xml, saml endpoint extractor, okta saml metadata viewer',
  openGraph: {
    url: 'https://developers.do/tools/saml-metadata-parser',
    title: 'SAML Metadata Parser - Free IdP/SP Metadata Inspector',
    description: 'Parse SAML metadata XML and extract endpoints, certificates, and configuration. 100% client-side.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function SamlMetadataParserPage() {
  return <SamlMetadataParser />;
}
