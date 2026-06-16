import type { Metadata } from 'next';
import CsrDecoder from '../../../components/tools/CsrDecoder/CsrDecoder';

export const metadata: Metadata = {
  title: 'Certificate & CSR Decoder - Inspect X.509 Certs and PKCS#10 CSRs',
  description: 'Free client-side certificate and CSR decoder. Paste any X.509 certificate (PEM/DER) or PKCS#10 certificate signing request and decode everything: subject, issuer, validity and expiry, SANs, key usage, extensions, public key, and fingerprints. Auto-detects the type. 100% in-browser.',
  keywords: 'certificate decoder, csr decoder, x509 decoder, ssl certificate decoder, pem decoder, certificate parser, certificate viewer, decode certificate online, pkcs10 decoder, certificate signing request viewer, x509 csr parser, openssl csr viewer, read certificate, decode pem certificate, check certificate expiry',
  openGraph: {
    url: 'https://developers.do/tools/csr-decoder',
    title: 'Certificate & CSR Decoder - Inspect X.509 Certs and PKCS#10 CSRs',
    description: 'Decode X.509 certificates and PKCS#10 CSRs locally in your browser. Auto-detects type and shows subject, issuer, validity, SANs, extensions, key details, and fingerprints.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function CsrDecoderPage() {
  return <CsrDecoder />;
}
