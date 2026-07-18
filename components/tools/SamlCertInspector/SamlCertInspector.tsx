'use client';

import { useState } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import { inspectCertificates, SAMPLE_PEM_CERT } from '../../../utils/samlCert';
import { getExpiryStatus } from '../../../utils/x509';
import type { X509Certificate } from '../../../utils/x509';
import type { CertInspectionResult } from '../../../utils/samlCert';

function expiryBadge(status: string): string {
  switch (status) {
    case 'valid':
      return 'bg-green-100 text-green-800';
    case 'expiring-soon':
      return 'bg-amber-100 text-amber-800';
    case 'expired':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-slate-100 text-slate-800';
  }
}

function expiryLabel(status: string): string {
  switch (status) {
    case 'valid':
      return 'Valid (>30 days)';
    case 'expiring-soon':
      return 'Expiring Soon (<30 days)';
    case 'expired':
      return 'Expired';
    default:
      return status;
  }
}

function CertDetail({ cert, index }: { cert: X509Certificate; index: number }) {
  const status = getExpiryStatus(cert);

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="font-medium text-slate-700">Certificate {index + 1}</span>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${expiryBadge(status)}`}>
            {expiryLabel(status)}
          </span>
          <CopyButton text={cert.pem} label="Copy PEM" />
        </div>
      </div>

      <div className="space-y-1 font-mono text-sm">
        {/* Subject */}
        <div>
          <span className="text-blue-600">Subject</span>
          <span className="text-slate-500">: </span>
          <span className="text-slate-900">{cert.subject || '(empty)'}</span>
        </div>
        {cert.subjectComponents.CN && (
          <div className="ml-4">
            <span className="text-blue-500">CN</span>
            <span className="text-slate-500">: </span>
            <span className="text-slate-900">{cert.subjectComponents.CN}</span>
          </div>
        )}

        {/* Issuer */}
        <div>
          <span className="text-blue-600">Issuer</span>
          <span className="text-slate-500">: </span>
          <span className="text-slate-900">{cert.issuer || '(empty)'}</span>
        </div>

        {/* Serial */}
        <div>
          <span className="text-blue-600">Serial Number</span>
          <span className="text-slate-500">: </span>
          <span className="text-slate-900 break-all">{cert.serialNumber}</span>
        </div>

        {/* Validity */}
        <div>
          <span className="text-blue-600">Not Before</span>
          <span className="text-slate-500">: </span>
          <span className="text-slate-900">{cert.notBefore.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-blue-600">Not After</span>
          <span className="text-slate-500">: </span>
          <span className={status === 'expired' ? 'text-red-700' : status === 'expiring-soon' ? 'text-amber-700' : 'text-slate-900'}>
            {cert.notAfter.toLocaleString()}
          </span>
        </div>

        {/* Algorithms */}
        <div>
          <span className="text-blue-600">Signature Algorithm</span>
          <span className="text-slate-500">: </span>
          <span className="text-slate-900">{cert.signatureAlgorithm}</span>
        </div>
        <div>
          <span className="text-blue-600">Public Key</span>
          <span className="text-slate-500">: </span>
          <span className="text-slate-900">
            {cert.publicKeyAlgorithm}
            {cert.publicKeySize ? ` (${cert.publicKeySize} bit)` : ''}
          </span>
        </div>

        {/* Key Usage */}
        {cert.keyUsage.length > 0 && (
          <div>
            <span className="text-blue-600">Key Usage</span>
            <span className="text-slate-500">: </span>
            <span className="text-slate-900">{cert.keyUsage.join(', ')}</span>
          </div>
        )}

        {/* Extended Key Usage */}
        {cert.extKeyUsage.length > 0 && (
          <div>
            <span className="text-blue-600">Extended Key Usage</span>
            <span className="text-slate-500">: </span>
            <span className="text-slate-900">{cert.extKeyUsage.join(', ')}</span>
          </div>
        )}

        {/* SANs */}
        {cert.sans.length > 0 && (
          <div>
            <span className="text-blue-600">Subject Alt Names</span>
            <span className="text-slate-500">: </span>
            <span className="text-slate-900">{cert.sans.join(', ')}</span>
          </div>
        )}

        {/* CA */}
        <div>
          <span className="text-blue-600">Is CA</span>
          <span className="text-slate-500">: </span>
          <span className="text-slate-900">{cert.isCA ? 'Yes' : 'No'}</span>
        </div>

        {/* Fingerprints */}
        <div className="pt-2 border-t border-slate-200 mt-2">
          <div>
            <span className="text-blue-600">SHA-1 Fingerprint</span>
            <span className="text-slate-500">: </span>
            <span className="text-slate-900 break-all">{cert.sha1Fingerprint}</span>
          </div>
          <div>
            <span className="text-blue-600">SHA-256 Fingerprint</span>
            <span className="text-slate-500">: </span>
            <span className="text-slate-900 break-all">{cert.sha256Fingerprint}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SamlCertInspector() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<CertInspectionResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const inspect = async () => {
    setLoading(true);
    try {
      const res = await inspectCertificates(input);
      if (res.success && res.data) {
        setResult(res.data);
        setError('');
      } else {
        setError(res.error || 'Failed to inspect certificates');
        setResult(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unexpected error');
      setResult(null);
    }
    setLoading(false);
  };

  const clear = () => {
    setInput('');
    setResult(null);
    setError('');
  };

  const loadSample = () => {
    setInput(SAMPLE_PEM_CERT);
    setResult(null);
    setError('');
  };

  return (
    <ToolLayout
      title="SAML Certificate Inspector"
      description="Inspect X.509 certificates from PEM, Base64 DER, SAML metadata, or SAML responses"
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <TextArea
            value={input}
            onChange={setInput}
            label="Certificate Input"
            placeholder="Paste a PEM certificate, Base64 DER, SAML metadata XML, or SAML response XML..."
            rows={8}
          />

          <div className="flex flex-wrap gap-3">
            <Button label={loading ? 'Inspecting...' : 'Inspect'} onClick={inspect} variant="primary" disabled={loading} />
            <Button label="Sample PEM" onClick={loadSample} variant="secondary" />
            <Button label="Clear" onClick={clear} variant="secondary" />
          </div>
        </div>

        {error && (
          <div role="alert" className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700 font-medium">Error:</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-4" aria-live="polite">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {result.format}
              </span>
              <span className="text-sm text-slate-600">
                {result.certificates.length} certificate{result.certificates.length !== 1 ? 's' : ''} found
              </span>
            </div>

            {result.certificates.map((cert, i) => (
              <CertDetail key={i} cert={cert} index={i} />
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export default SamlCertInspector;
