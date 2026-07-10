import type { Metadata } from 'next';
import SamlCertInspector from '../../../components/tools/SamlCertInspector/SamlCertInspector';

export const metadata: Metadata = {
  title: 'SAML Certificate Inspector - X.509 Certificate Viewer',
  description: 'Free client-side X.509 certificate inspector for SAML. View subject, issuer, validity, fingerprints, key usage, and SANs. Accepts PEM, Base64 DER, SAML metadata, or SAML response XML.',
  alternates: {
    canonical: '/tools/saml-cert-inspector',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/saml-cert-inspector',
    title: 'SAML Certificate Inspector - X.509 Certificate Details',
    description: 'Inspect X.509 certificates from SAML metadata, responses, or PEM files. View fingerprints, validity, and more. 100% client-side.',
    images: [{ url: '/og/tools/saml-cert-inspector.png', width: 1200, height: 630, alt: 'Developer Tools Dashboard' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/saml-cert-inspector.png'],
  },
};

export default function SamlCertInspectorPage() {
  return <SamlCertInspector />;
}
