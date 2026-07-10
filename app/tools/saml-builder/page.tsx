import type { Metadata } from 'next';
import SamlBuilder from '../../../components/tools/SamlBuilder/SamlBuilder';

export const metadata: Metadata = {
  title: 'SAML Assertion Builder - Generate Test SAML Responses & Requests',
  description: 'Free client-side SAML assertion builder. Generate SAML Responses, AuthnRequests, and LogoutRequests from form fields. Output as XML, Base64, or Base64+Deflate. Perfect for building test fixtures.',
  alternates: {
    canonical: '/tools/saml-builder',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/saml-builder',
    title: 'SAML Assertion Builder - Generate Test SAML Data',
    description: 'Generate SAML assertions, AuthnRequests, and LogoutRequests from form fields. Multiple output formats. 100% client-side.',
    images: [{ url: '/og/tools/saml-builder.png', width: 1200, height: 630, alt: 'Developer Tools Dashboard' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/saml-builder.png'],
  },
};

export default function SamlBuilderPage() {
  return <SamlBuilder />;
}
