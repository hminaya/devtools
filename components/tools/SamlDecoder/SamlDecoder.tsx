'use client';

import { useState } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import { decodeSaml, SAMPLE_SAML_RESPONSE, SAMPLE_SAML_REQUEST } from '../../../utils/saml';
import type { DecodedSaml } from '../../../utils/saml';

function statusColor(status?: string): string {
  switch (status) {
    case 'valid':
      return 'text-green-700 bg-green-50';
    case 'expired':
      return 'text-red-700 bg-red-50';
    case 'not-yet-valid':
      return 'text-amber-700 bg-amber-50';
    default:
      return 'text-slate-900';
  }
}

function SamlDecoder() {
  const [input, setInput] = useState('');
  const [decoded, setDecoded] = useState<DecodedSaml | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const decode = async () => {
    setLoading(true);
    try {
      const result = await decodeSaml(input);
      if (result.success && result.data) {
        setDecoded(result.data);
        setError('');
      } else {
        setError(result.error || 'Failed to decode SAML');
        setDecoded(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unexpected error');
      setDecoded(null);
    }
    setLoading(false);
  };

  const clear = () => {
    setInput('');
    setDecoded(null);
    setError('');
  };

  const loadSampleResponse = () => {
    setInput(SAMPLE_SAML_RESPONSE);
    setDecoded(null);
    setError('');
  };

  const loadSampleRequest = () => {
    setInput(SAMPLE_SAML_REQUEST);
    setDecoded(null);
    setError('');
  };

  return (
    <ToolLayout
      title="SAML Decoder"
      description="Decode SAML Requests and Responses from Base64 (with optional deflate) to readable XML"
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <TextArea
            value={input}
            onChange={setInput}
            label="Encoded SAML (Base64)"
            placeholder="Paste your Base64-encoded SAML Response or Request here..."
            rows={6}
          />

          <div className="flex flex-wrap gap-3">
            <Button label={loading ? 'Decoding...' : 'Decode'} onClick={decode} variant="primary" disabled={loading} />
            <Button label="Sample Response" onClick={loadSampleResponse} variant="secondary" />
            <Button label="Sample Request" onClick={loadSampleRequest} variant="secondary" />
            <Button label="Clear" onClick={clear} variant="secondary" />
          </div>
        </div>

        {error && (
          <div role="alert" className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700 font-medium">Error:</p>
            <p className="text-red-600 text-sm whitespace-pre-wrap">{error}</p>
          </div>
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
          <p className="text-amber-800 text-sm">
            <strong>Note:</strong> This tool decodes SAML data but does not verify XML digital signatures. Do not trust decoded data without proper signature verification using the IdP certificate.
          </p>
        </div>

        {decoded && (
          <div className="space-y-4" aria-live="polite">
            {/* Type Badge */}
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {decoded.type}
              </span>
            </div>

            {/* Key Fields */}
            {decoded.fields.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700">Extracted Fields</span>
                  <CopyButton
                    text={decoded.fields.map(f => `${f.label}: ${f.value}`).join('\n')}
                    label="Copy Fields"
                  />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
                  <div className="space-y-1">
                    {decoded.fields.map((field, i) => (
                      <div key={i} className="font-mono text-sm flex flex-wrap">
                        <span className="text-blue-600 shrink-0">{field.label}</span>
                        <span className="text-slate-500 mx-1">:</span>
                        <span className={`break-all rounded px-1 ${statusColor(field.status)}`}>
                          {field.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Attributes */}
            {decoded.attributes.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700">SAML Attributes</span>
                  <CopyButton
                    text={decoded.attributes.map(a => `${a.name}: ${a.values.join(', ')}`).join('\n')}
                    label="Copy Attributes"
                  />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
                  <div className="space-y-1">
                    {decoded.attributes.map((attr, i) => (
                      <div key={i} className="font-mono text-sm flex flex-wrap">
                        <span className="text-blue-600 shrink-0">{attr.name}</span>
                        <span className="text-slate-500 mx-1">:</span>
                        <span className="text-slate-900 break-all">{attr.values.join(', ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Pretty XML */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">Decoded XML</span>
                <CopyButton text={decoded.prettyXml} label="Copy XML" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
                <pre className="text-sm font-mono text-slate-900 whitespace-pre-wrap break-words max-h-96 overflow-auto">
                  {decoded.prettyXml}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export default SamlDecoder;
