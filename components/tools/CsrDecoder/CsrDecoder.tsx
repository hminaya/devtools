'use client';

import { useState } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import { SAMPLE_CSR } from '../../../utils/csr';
import { SAMPLE_PEM_CERT } from '../../../utils/samlCert';
import { decodePki, type PkiDecodeResult } from '../../../utils/pkiDecoder';
import { getExpiryStatus, type X509Certificate } from '../../../utils/x509';
import type { CertificateSigningRequest, CsrAttribute, CsrExtension } from '../../../utils/csr';

function DetailRow({ label, value, tone = 'normal' }: { label: string; value: string; tone?: 'normal' | 'danger' | 'warn' }) {
  const valueClass = tone === 'danger' ? 'text-red-700' : tone === 'warn' ? 'text-amber-700' : 'text-slate-900';
  return (
    <div className="font-mono text-sm">
      <span className="text-blue-600">{label}</span>
      <span className="text-slate-500">: </span>
      <span className={`${valueClass} break-all`}>{value}</span>
    </div>
  );
}

function MetadataCard({ title, children, copyText, copyLabel }: {
  title: string;
  children: React.ReactNode;
  copyText?: string;
  copyLabel?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2 gap-3">
        <label className="text-sm font-medium text-slate-700">{title}</label>
        {copyText && <CopyButton text={copyText} label={copyLabel || 'Copy'} />}
      </div>
      <div className="bg-slate-50 border border-slate-200 rounded-md p-4">{children}</div>
    </div>
  );
}

function expiryBadge(status: string): string {
  switch (status) {
    case 'valid': return 'bg-green-100 text-green-800';
    case 'expiring-soon': return 'bg-amber-100 text-amber-800';
    case 'expired': return 'bg-red-100 text-red-800';
    default: return 'bg-slate-100 text-slate-800';
  }
}

function expiryLabel(status: string): string {
  switch (status) {
    case 'valid': return 'Valid (>30 days)';
    case 'expiring-soon': return 'Expiring Soon (<30 days)';
    case 'expired': return 'Expired';
    default: return status;
  }
}

function AttributeList({ title, items }: { title: string; items: Array<CsrAttribute | CsrExtension> }) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {items.map((item) => (
        <div key={`${item.oid}-${item.name}`} className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-2">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="font-medium text-slate-900">{item.name}</p>
              <p className="text-sm text-slate-500 font-mono">{item.oid}</p>
            </div>
            {'critical' in item && item.critical && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">Critical</span>
            )}
          </div>
          <div className="space-y-1 font-mono text-sm">
            {item.values.length > 0 ? (
              item.values.map((value, index) => <div key={index} className="text-slate-900 break-all">{value}</div>)
            ) : (
              <div className="text-slate-500">(no decoded values)</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function CertificateView({ cert, index, total }: { cert: X509Certificate; index: number; total: number }) {
  const status = getExpiryStatus(cert);
  return (
    <div className="space-y-6">
      <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
            X.509 Certificate{total > 1 ? ` ${index + 1} of ${total}` : ''}
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${expiryBadge(status)}`}>{expiryLabel(status)}</span>
            <CopyButton text={cert.pem} label="Copy PEM" />
            <CopyButton text={cert.derBase64} label="Copy Base64 DER" />
          </div>
        </div>
        <div className="space-y-1">
          <DetailRow label="Subject" value={cert.subject || '(empty)'} />
          <DetailRow label="Issuer" value={cert.issuer || '(empty)'} />
          <DetailRow label="Serial Number" value={cert.serialNumber} />
          <DetailRow label="Not Before" value={cert.notBefore.toLocaleString()} />
          <DetailRow
            label="Not After"
            value={cert.notAfter.toLocaleString()}
            tone={status === 'expired' ? 'danger' : status === 'expiring-soon' ? 'warn' : 'normal'}
          />
          <DetailRow label="Signature Algorithm" value={cert.signatureAlgorithm} />
          <DetailRow label="Public Key" value={`${cert.publicKeyAlgorithm}${cert.publicKeySize ? ` (${cert.publicKeySize}-bit)` : ''}`} />
          <DetailRow label="Is CA" value={cert.isCA ? 'Yes' : 'No'} />
          <DetailRow label="SHA-1 Fingerprint" value={cert.sha1Fingerprint} />
          <DetailRow label="SHA-256 Fingerprint" value={cert.sha256Fingerprint} />
        </div>
      </div>

      {Object.keys(cert.subjectComponents).length > 0 && (
        <MetadataCard title="Subject Fields">
          <div className="space-y-1">
            {Object.entries(cert.subjectComponents).map(([k, v]) => <DetailRow key={k} label={k} value={v} />)}
          </div>
        </MetadataCard>
      )}

      {cert.sans.length > 0 && (
        <MetadataCard title="Subject Alternative Names">
          <div className="space-y-1 font-mono text-sm">
            {cert.sans.map((san, i) => <div key={i} className="text-slate-900 break-all">{san}</div>)}
          </div>
        </MetadataCard>
      )}

      {(cert.keyUsage.length > 0 || cert.extKeyUsage.length > 0) && (
        <MetadataCard title="Key Usage">
          <div className="space-y-2">
            {cert.keyUsage.length > 0 && <DetailRow label="Key Usage" value={cert.keyUsage.join(', ')} />}
            {cert.extKeyUsage.length > 0 && <DetailRow label="Extended Key Usage" value={cert.extKeyUsage.join(', ')} />}
          </div>
        </MetadataCard>
      )}

      <MetadataCard title="Raw PEM" copyText={cert.pem} copyLabel="Copy PEM">
        <pre className="text-sm font-mono text-slate-900 whitespace-pre-wrap break-words max-h-96 overflow-auto">{cert.pem}</pre>
      </MetadataCard>
    </div>
  );
}

function CsrView({ csr }: { csr: CertificateSigningRequest }) {
  return (
    <div className="space-y-6">
      <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">PKCS#10 CSR</span>
          <div className="flex gap-2 flex-wrap">
            <CopyButton text={csr.pem} label="Copy PEM" />
            <CopyButton text={csr.derBase64} label="Copy Base64 DER" />
          </div>
        </div>
        <div className="space-y-1">
          <DetailRow label="Version" value={String(csr.version)} />
          <DetailRow label="Subject" value={csr.subject || '(empty)'} />
          <DetailRow label="Public Key" value={`${csr.publicKeyAlgorithm}${csr.publicKeyCurve ? ` (${csr.publicKeyCurve})` : ''}${csr.publicKeySize ? ` ${csr.publicKeySize}-bit` : ''}`} />
          <DetailRow label="Signature Algorithm" value={csr.signatureAlgorithm} />
          {csr.challengePassword && <DetailRow label="Challenge Password" value={csr.challengePassword} />}
          <DetailRow label="SHA-1 Fingerprint" value={csr.sha1Fingerprint} />
          <DetailRow label="SHA-256 Fingerprint" value={csr.sha256Fingerprint} />
        </div>
      </div>

      {Object.keys(csr.subjectComponents).length > 0 && (
        <MetadataCard title="Subject Fields">
          <div className="space-y-1">
            {Object.entries(csr.subjectComponents).map(([k, v]) => <DetailRow key={k} label={k} value={v} />)}
          </div>
        </MetadataCard>
      )}

      {csr.sans.length > 0 && (
        <MetadataCard title="Subject Alternative Names">
          <div className="space-y-1 font-mono text-sm">
            {csr.sans.map((san, i) => <div key={i} className="text-slate-900 break-all">{san}</div>)}
          </div>
        </MetadataCard>
      )}

      {(csr.keyUsage.length > 0 || csr.extKeyUsage.length > 0) && (
        <MetadataCard title="Requested Key Usage">
          <div className="space-y-2">
            {csr.keyUsage.length > 0 && <DetailRow label="Key Usage" value={csr.keyUsage.join(', ')} />}
            {csr.extKeyUsage.length > 0 && <DetailRow label="Extended Key Usage" value={csr.extKeyUsage.join(', ')} />}
          </div>
        </MetadataCard>
      )}

      <AttributeList title="Attributes" items={csr.attributes} />
      <AttributeList title="Requested Extensions" items={csr.extensions} />

      <MetadataCard title="Raw PEM" copyText={csr.pem} copyLabel="Copy PEM">
        <pre className="text-sm font-mono text-slate-900 whitespace-pre-wrap break-words max-h-96 overflow-auto">{csr.pem}</pre>
      </MetadataCard>
    </div>
  );
}

function CsrDecoder() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<PkiDecodeResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const decode = async () => {
    setLoading(true);
    try {
      const parsed = await decodePki(input);
      if (parsed.success && parsed.data) {
        setResult(parsed.data);
        setError('');
      } else {
        setResult(null);
        setError(parsed.error || 'Failed to decode input');
      }
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : 'Unexpected error');
    }
    setLoading(false);
  };

  const reset = (sample?: string) => {
    setInput(sample || '');
    setResult(null);
    setError('');
  };

  return (
    <ToolLayout
      title="Certificate & CSR Decoder"
      description="Paste any X.509 certificate (PEM/DER) or PKCS#10 CSR and decode everything: subject, issuer, validity & expiry, SANs, key usage, extensions, public key, and fingerprints. Auto-detects the type."
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <TextArea
            value={input}
            onChange={setInput}
            label="Certificate or CSR Input"
            placeholder="Paste a PEM certificate, certificate chain, Base64 DER, or a PKCS#10 certificate signing request..."
            rows={10}
          />

          <div className="flex flex-wrap gap-3">
            <Button label={loading ? 'Decoding...' : 'Decode'} onClick={decode} variant="primary" disabled={loading} />
            <Button label="Sample Certificate" onClick={() => reset(SAMPLE_PEM_CERT)} variant="secondary" />
            <Button label="Sample CSR" onClick={() => reset(SAMPLE_CSR)} variant="secondary" />
            <Button label="Clear" onClick={() => reset()} variant="secondary" />
          </div>
        </div>

        {error && (
          <div role="alert" className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700 font-medium">Error:</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-blue-800 text-sm">
            Everything is decoded locally in your browser — the certificate or CSR you paste never leaves this page. This tool does not validate CA policy, the certificate chain of trust, or possession of the matching private key.
          </p>
        </div>

        {result && result.kind === 'csr' && (
          <div aria-live="polite">
            <CsrView csr={result.csr} />
          </div>
        )}

        {result && result.kind === 'certificate' && (
          <div aria-live="polite">
          <div className="space-y-6">
            {result.certificates.length > 1 && (
              <p className="text-sm text-slate-600">{result.certificates.length} certificates found (chain).</p>
            )}
{result.certificates.map((cert, i) => (
                <CertificateView key={i} cert={cert} index={i} total={result.certificates.length} />
              ))}
          </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export default CsrDecoder;
