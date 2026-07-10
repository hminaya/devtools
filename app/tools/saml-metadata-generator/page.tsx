import type { Metadata } from 'next';
import SamlMetadataGenerator from '../../../components/tools/SamlMetadataGenerator/SamlMetadataGenerator';

export const metadata: Metadata = {
  title: 'SAML Metadata Generator - Create SP & IdP Metadata XML',
  description: 'Free client-side SAML metadata generator. Build SAML 2.0 EntityDescriptor XML for Service Providers and Identity Providers: Entity ID, ACS/SSO/SLO endpoints, X.509 certificates, NameID formats, organization and contact info. 100% in-browser, nothing is uploaded.',
  alternates: {
    canonical: '/tools/saml-metadata-generator',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/saml-metadata-generator',
    title: 'SAML Metadata Generator - Create SP & IdP Metadata XML',
    description: 'Generate SAML 2.0 EntityDescriptor metadata for SPs and IdPs from form fields. 100% client-side.',
    images: [{ url: '/og/tools/saml-metadata-generator.png', width: 1200, height: 630, alt: 'Developer Tools Dashboard' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/saml-metadata-generator.png'],
  },
};

export default function SamlMetadataGeneratorPage() {
  return <SamlMetadataGenerator />;
}
