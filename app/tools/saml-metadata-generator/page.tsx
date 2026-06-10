import type { Metadata } from 'next';
import SamlMetadataGenerator from '../../../components/tools/SamlMetadataGenerator/SamlMetadataGenerator';

export const metadata: Metadata = {
  title: 'SAML Metadata Generator - Create SP & IdP Metadata XML',
  description: 'Free client-side SAML metadata generator. Build SAML 2.0 EntityDescriptor XML for Service Providers and Identity Providers: Entity ID, ACS/SSO/SLO endpoints, X.509 certificates, NameID formats, organization and contact info. 100% in-browser, nothing is uploaded.',
  keywords: 'saml metadata generator, sp metadata generator, idp metadata generator, saml metadata xml, entitydescriptor generator, saml metadata builder, create saml metadata, generate sp metadata, saml 2.0 metadata, sso metadata file, saml metadata creator',
  openGraph: {
    url: 'https://developers.do/tools/saml-metadata-generator',
    title: 'SAML Metadata Generator - Create SP & IdP Metadata XML',
    description: 'Generate SAML 2.0 EntityDescriptor metadata for SPs and IdPs from form fields. 100% client-side.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function SamlMetadataGeneratorPage() {
  return <SamlMetadataGenerator />;
}
