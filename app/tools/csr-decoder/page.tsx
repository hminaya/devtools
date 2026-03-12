import type { Metadata } from 'next';
import CsrDecoder from '../../../components/tools/CsrDecoder/CsrDecoder';

export const metadata: Metadata = {
  title: 'CSR Decoder - PKCS#10 Certificate Signing Request Inspector',
  description: 'Free client-side CSR decoder. Inspect PKCS#10 certificate signing requests, including subject fields, SANs, requested extensions, algorithms, and fingerprints.',
  keywords: 'csr decoder, csr inspector, pkcs10 decoder, certificate signing request viewer, x509 csr parser, pem csr tool, openssl csr viewer',
  openGraph: {
    url: 'https://developers.do/tools/csr-decoder',
    title: 'CSR Decoder - Certificate Signing Request Inspector',
    description: 'Decode PKCS#10 CSRs locally in your browser. View subject fields, SANs, requested extensions, key details, and raw PEM or DER data.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function CsrDecoderPage() {
  return <CsrDecoder />;
}
