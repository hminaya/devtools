/**
 * Unified PKI decoder.
 *
 * Auto-detects whether pasted input is an X.509 certificate (one or more) or a
 * PKCS#10 Certificate Signing Request, and dispatches to the existing parsers.
 * Pure orchestration — no new ASN.1 logic, so it inherits the battle-tested
 * behaviour of inspectCsr() and inspectCertificates(). Fully client-side.
 */

import { inspectCsr, type CertificateSigningRequest } from './csr';
import { inspectCertificates, type InputFormat } from './samlCert';
import type { X509Certificate } from './x509';

export type PkiKind = 'csr' | 'certificate';

export type PkiDecodeResult =
  | { kind: 'csr'; csr: CertificateSigningRequest }
  | { kind: 'certificate'; format: InputFormat; certificates: X509Certificate[] };

export async function decodePki(
  input: string
): Promise<{ success: boolean; data?: PkiDecodeResult; error?: string }> {
  const trimmed = input.trim();
  if (!trimmed) {
    return { success: false, error: 'Input is empty' };
  }

  const upper = trimmed.toUpperCase();

  // PKCS#10 CSR — matches both "CERTIFICATE REQUEST" and "NEW CERTIFICATE REQUEST".
  if (upper.includes('CERTIFICATE REQUEST')) {
    const r = await inspectCsr(trimmed);
    if (r.success && r.data) return { success: true, data: { kind: 'csr', csr: r.data } };
    return { success: false, error: r.error || 'Failed to decode CSR.' };
  }

  // X.509 certificate (PEM) or SAML XML carrying certificates.
  if (upper.includes('BEGIN CERTIFICATE') || trimmed.startsWith('<')) {
    const r = await inspectCertificates(trimmed);
    if (r.success && r.data && r.data.certificates.length > 0) {
      return { success: true, data: { kind: 'certificate', format: r.data.format, certificates: r.data.certificates } };
    }
    return { success: false, error: r.error || 'No certificates found in input.' };
  }

  // Headerless Base64 DER: try certificate first, then fall back to CSR.
  const certTry = await inspectCertificates(trimmed);
  if (certTry.success && certTry.data && certTry.data.certificates.length > 0) {
    return { success: true, data: { kind: 'certificate', format: certTry.data.format, certificates: certTry.data.certificates } };
  }

  const csrTry = await inspectCsr(trimmed);
  if (csrTry.success && csrTry.data) {
    return { success: true, data: { kind: 'csr', csr: csrTry.data } };
  }

  return {
    success: false,
    error: 'Unable to parse input. Paste a PEM or Base64 DER X.509 certificate, or a PKCS#10 certificate signing request.',
  };
}
