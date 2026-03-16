import type { Metadata } from 'next';
import SamlBuilder from '../../../components/tools/SamlBuilder/SamlBuilder';

export const metadata: Metadata = {
  title: 'SAML Assertion Builder - Generate Test SAML Responses & Requests',
  description: 'Free client-side SAML assertion builder. Generate SAML Responses, AuthnRequests, and LogoutRequests from form fields. Output as XML, Base64, or Base64+Deflate. Perfect for building test fixtures.',
  keywords: 'saml builder, saml assertion generator, saml response builder, saml authn request, saml test, saml mock, saml fixture, sso testing, how to generate a saml response, create saml test fixture, mock saml assertion, saml sso testing tool',
  openGraph: {
    url: 'https://developers.do/tools/saml-builder',
    title: 'SAML Assertion Builder - Generate Test SAML Data',
    description: 'Generate SAML assertions, AuthnRequests, and LogoutRequests from form fields. Multiple output formats. 100% client-side.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function SamlBuilderPage() {
  return <SamlBuilder />;
}
