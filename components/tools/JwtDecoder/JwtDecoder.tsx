'use client';

import { useState } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import { decodeJWT, formatTimestamp } from '../../../utils/jwt';
import type { DecodedJWT } from '../../../utils/jwt';

function JwtDecoder() {
  const [input, setInput] = useState('');
  const [decoded, setDecoded] = useState<DecodedJWT | null>(null);
  const [error, setError] = useState('');

  const decode = () => {
    const result = decodeJWT(input);

    if (result.success && result.data) {
      setDecoded(result.data);
      setError('');
    } else {
      setError(result.error || 'Failed to decode JWT');
      setDecoded(null);
    }
  };

  const clear = () => {
    setInput('');
    setDecoded(null);
    setError('');
  };

  const generateSample = () => {
    // Sample JWT token (this is a publicly available example token)
    const sample = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MzU2ODk2MDAsImFkbWluIjp0cnVlfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    setInput(sample);
    setDecoded(null);
    setError('');
  };

  const renderPayloadValue = (key: string, value: any): React.JSX.Element => {
    // Special handling for timestamp fields
    if ((key === 'exp' || key === 'iat' || key === 'nbf') && typeof value === 'number') {
      return (
        <div>
          <span className="text-slate-900">{value}</span>
          <span className="text-slate-500 text-sm ml-2">({formatTimestamp(value)})</span>
        </div>
      );
    }
    return <span className="text-slate-900">{JSON.stringify(value)}</span>;
  };

  return (
    <ToolLayout
      title="JWT Decoder"
      description="Decode and inspect JWT (JSON Web Token) contents"
    >
      <div className="space-y-6">
        {/* Input Section */}
        <div className="space-y-4">
          <TextArea
            value={input}
            onChange={setInput}
            label="JWT Token"
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            rows={6}
          />

          <div className="flex flex-wrap gap-3">
            <Button label="Decode" onClick={decode} variant="primary" />
            <Button label="Load Sample" onClick={generateSample} variant="secondary" />
            <Button label="Clear" onClick={clear} variant="secondary" />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700 font-medium">Error:</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Warning Note */}
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
          <p className="text-amber-800 text-sm">
            <strong>Note:</strong> This tool decodes JWT tokens but does not verify signatures. Never trust decoded JWT data without proper server-side verification.
          </p>
        </div>

        {/* Decoded Output */}
        {decoded && (
          <div className="space-y-4">
            {/* Header */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-700">Header</label>
                <CopyButton text={JSON.stringify(decoded.header, null, 2)} label="Copy Header" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
                <div className="space-y-1">
                  {Object.entries(decoded.header).map(([key, value]) => (
                    <div key={key} className="font-mono text-sm">
                      <span className="text-blue-600">{key}</span>
                      <span className="text-slate-500">: </span>
                      <span className="text-slate-900">{JSON.stringify(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Payload */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-700">Payload</label>
                <CopyButton text={JSON.stringify(decoded.payload, null, 2)} label="Copy Payload" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
                <div className="space-y-1">
                  {Object.entries(decoded.payload).map(([key, value]) => (
                    <div key={key} className="font-mono text-sm">
                      <span className="text-blue-600">{key}</span>
                      <span className="text-slate-500">: </span>
                      {renderPayloadValue(key, value)}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Signature */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-700">Signature (Base64 URL Encoded)</label>
                <CopyButton text={decoded.signature} label="Copy Signature" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
                <p className="font-mono text-sm text-slate-900 break-all">{decoded.signature}</p>
              </div>
            </div>

            {/* Full Decoded JSON */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-700">Full Decoded Token (JSON)</label>
                <CopyButton
                  text={JSON.stringify({ header: decoded.header, payload: decoded.payload }, null, 2)}
                  label="Copy JSON"
                />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
                <pre className="text-sm font-mono text-slate-900 whitespace-pre-wrap break-words max-h-96 overflow-auto">
                  {JSON.stringify({ header: decoded.header, payload: decoded.payload }, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export default JwtDecoder;
