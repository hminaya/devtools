'use client';

import { useState } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import {
  parseMetadata,
  getBindingLabel,
  getNameIdLabel,
  SAMPLE_IDP_METADATA,
  SAMPLE_SP_METADATA,
} from '../../../utils/samlMetadata';
import { getExpiryStatus } from '../../../utils/x509';
import { trackToolEvent } from '../../../utils/analytics';
import type { ParsedMetadata } from '../../../utils/samlMetadata';

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
      return 'Valid';
    case 'expiring-soon':
      return 'Expiring Soon';
    case 'expired':
      return 'Expired';
    default:
      return status;
  }
}

function SamlMetadataParser() {
  const [input, setInput] = useState('');
  const [parsed, setParsed] = useState<ParsedMetadata | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const parse = async () => {
    setLoading(true);
    try {
      const result = await parseMetadata(input);
      if (result.success && result.data) {
        trackToolEvent('tool_success', {
          tool_id: 'saml-metadata-parser',
          action: 'Parse SAML metadata',
          method: result.data.type,
        });
        setParsed(result.data);
        setError('');
      } else {
        trackToolEvent('tool_error', {
          tool_id: 'saml-metadata-parser',
          action: 'Parse SAML metadata',
          label: result.error || 'Failed to parse metadata',
        });
        setError(result.error || 'Failed to parse metadata');
        setParsed(null);
      }
    } catch (e) {
      trackToolEvent('tool_error', {
        tool_id: 'saml-metadata-parser',
        action: 'Parse SAML metadata',
        label: e instanceof Error ? e.message : 'Unexpected error',
      });
      setError(e instanceof Error ? e.message : 'Unexpected error');
      setParsed(null);
    }
    setLoading(false);
  };

  const clear = () => {
    setInput('');
    setParsed(null);
    setError('');
  };

  return (
    <ToolLayout
      title="SAML Metadata Parser"
      description="Parse SAML Metadata XML and extract IdP/SP configuration, endpoints, certificates, and NameID formats"
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <TextArea
            value={input}
            onChange={setInput}
            label="SAML Metadata XML"
            placeholder="Paste your SAML metadata XML here..."
            rows={8}
          />

          <div className="flex flex-wrap gap-3">
            <Button label={loading ? 'Parsing...' : 'Parse'} onClick={parse} variant="primary" disabled={loading} />
            <Button label="Sample IdP" onClick={() => { setInput(SAMPLE_IDP_METADATA); setParsed(null); setError(''); }} variant="secondary" />
            <Button label="Sample SP" onClick={() => { setInput(SAMPLE_SP_METADATA); setParsed(null); setError(''); }} variant="secondary" />
            <Button label="Clear" onClick={clear} variant="secondary" />
          </div>
        </div>

        {error && (
          <div role="alert" className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700 font-medium">Error:</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {parsed && (
          <div className="space-y-4" aria-live="polite">
            {/* Entity Info */}
            <div>
              <span className="text-sm font-medium text-slate-700 mb-2 block">Entity Information</span>
              <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-2">
                <div className="font-mono text-sm flex flex-wrap items-center gap-2">
                  <span className="text-blue-600">Entity ID</span>
                  <span className="text-slate-500">:</span>
                  <span className="text-slate-900 break-all">{parsed.entityId}</span>
                  <CopyButton text={parsed.entityId} label="Copy" />
                </div>
                <div className="font-mono text-sm">
                  <span className="text-blue-600">Type</span>
                  <span className="text-slate-500">: </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {parsed.type}
                  </span>
                </div>
                {parsed.wantAuthnRequestsSigned && (
                  <div className="font-mono text-sm">
                    <span className="text-blue-600">WantAuthnRequestsSigned</span>
                    <span className="text-slate-500">: </span>
                    <span className="text-green-700">true</span>
                  </div>
                )}
                {parsed.authnRequestsSigned && (
                  <div className="font-mono text-sm">
                    <span className="text-blue-600">AuthnRequestsSigned</span>
                    <span className="text-slate-500">: </span>
                    <span className="text-green-700">true</span>
                  </div>
                )}
              </div>
            </div>

            {/* Organization */}
            {parsed.organization && (
              <div>
                <span className="text-sm font-medium text-slate-700 mb-2 block">Organization</span>
                <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-1">
                  {parsed.organization.name && (
                    <div className="font-mono text-sm">
                      <span className="text-blue-600">Name</span>
                      <span className="text-slate-500">: </span>
                      <span className="text-slate-900">{parsed.organization.name}</span>
                    </div>
                  )}
                  {parsed.organization.displayName && (
                    <div className="font-mono text-sm">
                      <span className="text-blue-600">Display Name</span>
                      <span className="text-slate-500">: </span>
                      <span className="text-slate-900">{parsed.organization.displayName}</span>
                    </div>
                  )}
                  {parsed.organization.url && (
                    <div className="font-mono text-sm">
                      <span className="text-blue-600">URL</span>
                      <span className="text-slate-500">: </span>
                      <span className="text-slate-900">{parsed.organization.url}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Endpoints */}
            {parsed.endpoints.length > 0 && (
              <div>
                <span className="text-sm font-medium text-slate-700 mb-2 block">Endpoints</span>
                <div className="bg-slate-50 border border-slate-200 rounded-md divide-y divide-slate-200">
                  {parsed.endpoints.map((ep, i) => (
                    <div key={i} className="p-3 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                          {ep.type}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-200 text-slate-700">
                          {ep.binding}
                        </span>
                        {ep.index !== undefined && (
                          <span className="text-xs text-slate-500">index={ep.index}</span>
                        )}
                        {ep.isDefault && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            default
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-sm text-slate-900 break-all flex items-center gap-2">
                        <span>{ep.location}</span>
                        <CopyButton text={ep.location} label="Copy" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certificates */}
            {parsed.certificates.length > 0 && (
              <div>
                <span className="text-sm font-medium text-slate-700 mb-2 block">
                  Certificates ({parsed.certificates.length})
                </span>
                <div className="space-y-3">
                  {parsed.certificates.map((cert, i) => {
                    const status = getExpiryStatus(cert);
                    return (
                      <div key={i} className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="font-medium text-slate-700">Certificate {i + 1}</span>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${expiryBadge(status)}`}>
                              {expiryLabel(status)}
                            </span>
                            <CopyButton text={cert.pem} label="Copy PEM" />
                          </div>
                        </div>
                        <div className="space-y-1 font-mono text-sm">
                          <div><span className="text-blue-600">Subject</span><span className="text-slate-500">: </span><span className="text-slate-900">{cert.subject}</span></div>
                          <div><span className="text-blue-600">Issuer</span><span className="text-slate-500">: </span><span className="text-slate-900">{cert.issuer}</span></div>
                          <div><span className="text-blue-600">Valid</span><span className="text-slate-500">: </span><span className="text-slate-900">{cert.notBefore.toLocaleDateString()} - {cert.notAfter.toLocaleDateString()}</span></div>
                          <div><span className="text-blue-600">SHA-1</span><span className="text-slate-500">: </span><span className="text-slate-900 break-all">{cert.sha1Fingerprint}</span></div>
                          <div><span className="text-blue-600">SHA-256</span><span className="text-slate-500">: </span><span className="text-slate-900 break-all">{cert.sha256Fingerprint}</span></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* NameID Formats */}
            {parsed.nameIdFormats.length > 0 && (
              <div>
                <span className="text-sm font-medium text-slate-700 mb-2 block">NameID Formats</span>
                <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
                  <div className="space-y-1">
                    {parsed.nameIdFormats.map((format, i) => (
                      <div key={i} className="font-mono text-sm flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-200 text-slate-700">
                          {getNameIdLabel(format)}
                        </span>
                        <span className="text-slate-500 text-xs break-all">{format}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Requested Attributes */}
            {parsed.requestedAttributes.length > 0 && (
              <div>
                <span className="text-sm font-medium text-slate-700 mb-2 block">Requested Attributes</span>
                <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
                  <div className="space-y-1">
                    {parsed.requestedAttributes.map((attr, i) => (
                      <div key={i} className="font-mono text-sm flex items-center gap-2 flex-wrap">
                        <span className="text-slate-900">{attr.friendlyName || attr.name}</span>
                        {attr.required && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            required
                          </span>
                        )}
                        {attr.friendlyName && (
                          <span className="text-slate-500 text-xs break-all">{attr.name}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export default SamlMetadataParser;
