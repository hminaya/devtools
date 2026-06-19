import type { Metadata } from 'next';
import SamlValidator from '../../../components/tools/SamlValidator/SamlValidator';

export const metadata: Metadata = {
  title: 'SAML Response Validator - Debug Why SSO Login Fails',
  description: 'Free client-side SAML response validator and SSO debugger. Paste a SAML Response to check status, NotBefore/NotOnOrAfter timing, audience, recipient, InResponseTo, issuer, and signature presence — and find out why your SAML login is rejected. 100% in-browser, nothing is uploaded.',
  keywords: 'saml validator, saml response validator, validate saml response, saml debugger, saml sso debug, why is my saml failing, saml response invalid, debug saml, saml troubleshooting, saml not working, saml assertion expired, saml audience mismatch, check saml response',
  alternates: {
    canonical: '/tools/saml-validator',
  },
  openGraph: {
    url: 'https://developers.do/tools/saml-validator',
    title: 'SAML Response Validator - Debug Why SSO Login Fails',
    description: 'Paste a SAML Response and get a plain-English checklist of what passes and what would break your SSO login. 100% client-side.',
    images: [{ url: '/og/tools/saml-validator.png', width: 1200, height: 630, alt: 'Developer Tools Dashboard' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/saml-validator.png'],
  },
};

export default function SamlValidatorPage() {
  return <SamlValidator />;
}
