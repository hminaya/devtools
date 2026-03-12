'use client';

import { useState } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import { inspectCsr, SAMPLE_CSR } from '../../../utils/csr';
import type { CertificateSigningRequest, CsrAttribute, CsrExtension } from '../../../utils/csr';

function DetailRow({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="font-mono text-sm">
      <span className="text-blue-600">{label}</span>
      <span className="text-slate-500">: </span>
      <span className={`${danger ? 'text-red-700' : 'text-slate-900'} break-all`}>{value}</span>
    </div>
  );
}

function SubjectFields({ components }: { components: Record<string, string> }) {
  const entries = Object.entries(components);
  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1">
      {entries.map(([key, value]) => (
        <DetailRow key={key} label={key} value={value} />
      ))}
    </div>
  );
}

function MetadataCard({
  title,
  children,
  copyText,
  copyLabel,
}: {
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

function AttributeList({
  title,
  items,
}: {
  title: string;
  items: Array<CsrAttribute | CsrExtension>;
}) {
  if (items.length === 0) {
    return null;
  }

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
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                Critical
              </span>
            )}
          </div>
          <div className="space-y-1 font-mono text-sm">
            {item.values.length > 0 ? (
              item.values.map((value, index) => (
                <div key={index} className="text-slate-900 break-all">
                  {value}
                </div>
              ))
            ) : (
              <div className="text-slate-500">(no decoded values)</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function CsrDecoder() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<CertificateSigningRequest | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const decode = async () => {
    setLoading(true);
    try {
      const parsed = await inspectCsr(input);
      if (parsed.success && parsed.data) {
        setResult(parsed.data);
        setError('');
      } else {
        setResult(null);
        setError(parsed.error || 'Failed to decode CSR');
      }
    } catch (decodeError) {
      setResult(null);
      setError(decodeError instanceof Error ? decodeError.message : 'Unexpected error');
    }
    setLoading(false);
  };

  const clear = () => {
    setInput('');
    setResult(null);
    setError('');
  };

  const loadSample = () => {
    setInput(SAMPLE_CSR);
    setResult(null);
    setError('');
  };

  return (
    <ToolLayout
      title="CSR Decoder / Inspector"
      description="Decode and inspect PKCS#10 certificate signing requests. View subject fields, SANs, requested extensions, algorithms, and raw CSR data."
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <TextArea
            value={input}
            onChange={setInput}
            label="CSR Input"
            placeholder="Paste a PEM CSR or Base64 DER PKCS#10 request..."
            rows={10}
          />

          <div className="flex flex-wrap gap-3">
            <Button label={loading ? 'Decoding...' : 'Decode CSR'} onClick={decode} variant="primary" disabled={loading} />
            <Button label="Load Sample" onClick={loadSample} variant="secondary" />
            <Button label="Clear" onClick={clear} variant="secondary" />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700 font-medium">Error:</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-blue-800 text-sm">
            <strong>Note:</strong> This tool decodes CSR contents locally in your browser. It does not validate CA policy or prove possession of the matching private key.
          </p>
        </div>

        {result && (
          <div className="space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  PKCS#10 CSR
                </span>
                <div className="flex gap-2 flex-wrap">
                  <CopyButton text={result.pem} label="Copy PEM" />
                  <CopyButton text={result.derBase64} label="Copy Base64 DER" />
                </div>
              </div>

              <div className="space-y-1">
                <DetailRow label="Version" value={String(result.version)} />
                <DetailRow label="Subject" value={result.subject || '(empty)'} />
                <DetailRow
                  label="Public Key"
                  value={`${result.publicKeyAlgorithm}${result.publicKeyCurve ? ` (${result.publicKeyCurve})` : ''}${result.publicKeySize ? ` ${result.publicKeySize}-bit` : ''}`}
                />
                <DetailRow label="Signature Algorithm" value={result.signatureAlgorithm} />
                {result.challengePassword && (
                  <DetailRow label="Challenge Password" value={result.challengePassword} />
                )}
                <DetailRow label="SHA-1 Fingerprint" value={result.sha1Fingerprint} />
                <DetailRow label="SHA-256 Fingerprint" value={result.sha256Fingerprint} />
              </div>
            </div>

            <MetadataCard title="Subject Fields">
              <SubjectFields components={result.subjectComponents} />
            </MetadataCard>

            {result.sans.length > 0 && (
              <MetadataCard title="Subject Alternative Names">
                <div className="space-y-1 font-mono text-sm">
                  {result.sans.map((san, index) => (
                    <div key={index} className="text-slate-900 break-all">
                      {san}
                    </div>
                  ))}
                </div>
              </MetadataCard>
            )}

            {(result.keyUsage.length > 0 || result.extKeyUsage.length > 0) && (
              <MetadataCard title="Requested Key Usage">
                <div className="space-y-2">
                  {result.keyUsage.length > 0 && (
                    <DetailRow label="Key Usage" value={result.keyUsage.join(', ')} />
                  )}
                  {result.extKeyUsage.length > 0 && (
                    <DetailRow label="Extended Key Usage" value={result.extKeyUsage.join(', ')} />
                  )}
                </div>
              </MetadataCard>
            )}

            <AttributeList title="Attributes" items={result.attributes} />
            <AttributeList title="Requested Extensions" items={result.extensions} />

            <MetadataCard title="Raw PEM CSR" copyText={result.pem} copyLabel="Copy PEM">
              <pre className="text-sm font-mono text-slate-900 whitespace-pre-wrap break-words max-h-96 overflow-auto">
                {result.pem}
              </pre>
            </MetadataCard>

            <MetadataCard title="Base64 DER" copyText={result.derBase64} copyLabel="Copy Base64 DER">
              <pre className="text-sm font-mono text-slate-900 whitespace-pre-wrap break-words max-h-96 overflow-auto">
                {result.derBase64}
              </pre>
            </MetadataCard>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export default CsrDecoder;
