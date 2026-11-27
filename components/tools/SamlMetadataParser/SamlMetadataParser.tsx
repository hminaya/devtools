'use client';

import { useState } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import {
  parseMetadata,
  validateMetadata,
  getBindingLabel,
  getNameIdLabel,
  SAMPLE_IDP_METADATA,
  SAMPLE_SP_METADATA,
} from '../../../utils/samlMetadata';
import { getExpiryStatus } from '../../../utils/x509';
import { trackToolEvent } from '../../../utils/analytics';
import type { MetadataFinding, ParsedMetadata } from '../../../utils/samlMetadata';

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

function ValidationReport({ findings }: { findings: MetadataFinding[] }) {
  const errors = findings.filter((finding) => finding.severity === 'error').length;
  const warnings = findings.length - errors;
  const summary = findings.length === 0
    ? 'No issues found in the checks performed.'
    : `${errors} ${errors === 1 ? 'error' : 'errors'}, ${warnings} ${warnings === 1 ? 'warning' : 'warnings'}`;

  return (
    <section aria-labelledby="saml-metadata-validation" className="space-y-3">
      <div>
        <h2 id="saml-metadata-validation" className="font-semibold text-slate-900">SAML Metadata Validation</h2>
        <p className="mt-1 text-sm text-slate-700">{summary}</p>
      </div>
      {findings.length > 0 && (
        <ul className="space-y-2">
          {findings.map(({ severity, location, message, fix }) => (
            <li key={`${location}-${message}`} className={`rounded-md border p-3 text-sm ${severity === 'error' ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'}`}>
              <p className="font-semibold text-slate-900 break-words">
                <span className={severity === 'error' ? 'mr-2 text-red-800' : 'mr-2 text-amber-900'}>{severity === 'error' ? 'Error' : 'Warning'}</span>
                {message}
              </p>
              <code className="mt-1 block break-all text-xs text-slate-600">{location}</code>
              <p className="mt-1 text-slate-700">{fix}</p>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-slate-600">These checks cover common IdP and SP configuration issues. Use your SAML library for full schema and signature verification.</p>
    </section>
  );
}

function SamlMetadataParser() {
  const [input, setInput] = useState('');
  const [parsed, setParsed] = useState<ParsedMetadata | null>(null);
  const [findings, setFindings] = useState<MetadataFinding[] | null>(null);
  const [error, setError] = useState('');
  const [running, setRunning] = useState<'parse' | 'validate' | null>(null);

  const parse = async () => {
    setRunning('parse');
    setFindings(null);
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
          label: 'Failed to parse metadata',
        });
        setError(result.error || 'Failed to parse metadata');
        setParsed(null);
      }
    } catch (e) {
      trackToolEvent('tool_error', {
        tool_id: 'saml-metadata-parser',
        action: 'Parse SAML metadata',
        label: 'Unexpected error',
      });
      setError(e instanceof Error ? e.message : 'Unexpected error');
      setParsed(null);
    } finally {
      setRunning(null);
    }
  };

  const validate = async () => {
    setRunning('validate');
    setParsed(null);
    setError('');
    setFindings(null);
    try {
      setFindings(await validateMetadata(input));
    } catch {
      setError('Unable to complete validation. Try loading the metadata again.');
    } finally {
      setRunning(null);
    }
  };

  const replaceInput = (value: string) => {
    setInput(value);
    setParsed(null);
    setFindings(null);
    setError('');
  };

  return (
    <ToolLayout
      title="SAML Metadata Parser"
      description="Parse SAML metadata XML and validate IdP or SP configuration in your browser"
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <TextArea
            value={input}
            onChange={(value) => { setInput(value); setFindings(null); }}
            label="SAML Metadata XML"
            placeholder="Paste your SAML metadata XML here..."
            rows={8}
            readOnly={running !== null}
          />

          <div className="flex flex-wrap gap-3">
            <Button label={running === 'parse' ? 'Parsing...' : 'Parse'} onClick={parse} disabled={running !== null} />
            <Button label={running === 'validate' ? 'Validating...' : 'Validate'} onClick={validate} disabled={running !== null} />
            <Button label="Sample IdP" onClick={() => replaceInput(SAMPLE_IDP_METADATA)} variant="secondary" disabled={running !== null} />
            <Button label="Sample SP" onClick={() => replaceInput(SAMPLE_SP_METADATA)} variant="secondary" disabled={running !== null} />
            <Button label="Clear" onClick={() => replaceInput('')} variant="secondary" disabled={running !== null} />
          </div>
        </div>

        {error && (
          <div role="alert" className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700 font-medium">Error:</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div aria-live="polite" className={findings === null ? 'sr-only' : undefined}>
          {findings !== null && <ValidationReport findings={findings} />}
        </div>

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
