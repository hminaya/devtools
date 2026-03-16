import type { Metadata } from 'next';
import SamlCertInspector from '../../../components/tools/SamlCertInspector/SamlCertInspector';

export const metadata: Metadata = {
  title: 'SAML Certificate Inspector - X.509 Certificate Viewer',
  description: 'Free client-side X.509 certificate inspector for SAML. View subject, issuer, validity, fingerprints, key usage, and SANs. Accepts PEM, Base64 DER, SAML metadata, or SAML response XML.',
  keywords: 'x509 certificate inspector, saml certificate viewer, certificate fingerprint, pem viewer, certificate expiry, ssl certificate inspector, saml signing certificate, how to view saml certificate, check saml signing cert expiry, x509 pem viewer online, saml certificate details',
  openGraph: {
    url: 'https://developers.do/tools/saml-cert-inspector',
    title: 'SAML Certificate Inspector - X.509 Certificate Details',
    description: 'Inspect X.509 certificates from SAML metadata, responses, or PEM files. View fingerprints, validity, and more. 100% client-side.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function SamlCertInspectorPage() {
  return <SamlCertInspector />;
}
