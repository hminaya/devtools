'use client';

import { useState } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import {
  validateSamlResponse,
  buildSampleResponse,
  buildBrokenSampleResponse,
  CLOCK_SKEW_SECONDS,
  type ValidationResult,
  type CheckStatus,
} from '../../../utils/samlValidator';

const STATUS_META: Record<CheckStatus, { badge: string; icon: string; label: string }> = {
  pass: { badge: 'bg-green-100 text-green-800', icon: '✓', label: 'Pass' },
  warn: { badge: 'bg-amber-100 text-amber-800', icon: '!', label: 'Warning' },
  fail: { badge: 'bg-red-100 text-red-800', icon: '✕', label: 'Fail' },
  info: { badge: 'bg-slate-200 text-slate-700', icon: 'i', label: 'Info' },
};

function InputField({ label, value, onChange, placeholder }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function SamlValidator() {
  const [input, setInput] = useState('');
  const [audience, setAudience] = useState('');
  const [destination, setDestination] = useState('');
  const [inResponseTo, setInResponseTo] = useState('');
  const [issuer, setIssuer] = useState('');
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = async () => {
    setLoading(true);
    try {
      const res = await validateSamlResponse(input, { audience, destination, inResponseTo, issuer });
      if (res.success && res.data) {
        setResult(res.data);
        setError('');
      } else {
        setError(res.error || 'Failed to validate SAML response');
        setResult(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unexpected error');
      setResult(null);
    }
    setLoading(false);
  };

  const reset = () => {
    setInput('');
    setAudience('');
    setDestination('');
    setInResponseTo('');
    setIssuer('');
    setResult(null);
    setError('');
  };

  const loadSample = (broken: boolean) => {
    setInput(broken ? buildBrokenSampleResponse() : buildSampleResponse());
    setResult(null);
    setError('');
  };

  const copyReport = () => {
    if (!result) return '';
    return result.checks.map(c => `[${STATUS_META[c.status].label}] ${c.label}: ${c.detail}`).join('\n');
  };

  return (
    <ToolLayout
      title="SAML Response Validator"
      description="Debug a SAML Response: check status, timing, audience, recipient, InResponseTo, issuer, and signature presence — and find out why your SSO login is failing"
    >
      <div className="space-y-6">
        {/* Privacy note */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-blue-800 text-sm">
            Validation runs entirely in your browser. The SAML response you paste — including live assertions — never leaves this page.
          </p>
        </div>

        <TextArea
          value={input}
          onChange={setInput}
          label="SAML Response (Base64 or raw XML)"
          placeholder="Paste the Base64-encoded SAMLResponse from the form POST, or the raw XML..."
          rows={6}
        />

        {/* Optional expected values */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            Expected values <span className="font-normal text-slate-500">(optional — enables exact matching)</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Expected Audience (SP entity ID)" value={audience} onChange={setAudience} placeholder="https://sp.example.com" />
            <InputField label="Expected Destination / ACS URL" value={destination} onChange={setDestination} placeholder="https://sp.example.com/acs" />
            <InputField label="Expected Issuer (IdP entity ID)" value={issuer} onChange={setIssuer} placeholder="https://idp.example.com" />
            <InputField label="Expected InResponseTo (request ID)" value={inResponseTo} onChange={setInResponseTo} placeholder="_request_abc123" />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button label={loading ? 'Validating...' : 'Validate'} onClick={validate} variant="primary" disabled={loading} />
          <Button label="Sample (valid)" onClick={() => loadSample(false)} variant="secondary" />
          <Button label="Sample (broken)" onClick={() => loadSample(true)} variant="secondary" />
          <Button label="Reset" onClick={reset} variant="secondary" />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700 font-medium">Error:</p>
            <p className="text-red-600 text-sm whitespace-pre-wrap">{error}</p>
          </div>
        )}

        {/* Signature caveat */}
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
          <p className="text-amber-800 text-sm">
            <strong>Note:</strong> This validator checks structure and timing (the cause of most SSO failures) and reports whether a signature is present. It does <strong>not</strong> cryptographically verify the XML signature — that requires canonicalization and your IdP&apos;s certificate. A clean report is not proof the signature is valid.
          </p>
        </div>

        {result && (
          <div className="space-y-4">
            {/* Verdict */}
            <div className={`rounded-md p-4 border ${result.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className={`text-lg font-semibold ${result.valid ? 'text-green-800' : 'text-red-800'}`}>
                  {result.valid ? '✓ No blocking issues found' : '✕ Found issues that would break SSO'}
                </span>
                <div className="flex gap-2 text-sm">
                  <span className="inline-flex items-center px-2 py-0.5 rounded font-medium bg-green-100 text-green-800">{result.summary.pass} pass</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded font-medium bg-amber-100 text-amber-800">{result.summary.warn} warn</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded font-medium bg-red-100 text-red-800">{result.summary.fail} fail</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">Timestamps allow ±{CLOCK_SKEW_SECONDS}s of clock skew.</p>
            </div>

            {/* Checklist */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-700">Checks</label>
                <CopyButton text={copyReport()} label="Copy Report" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-md divide-y divide-slate-200">
                {result.checks.map((check, i) => {
                  const meta = STATUS_META[check.status];
                  return (
                    <div key={i} className="p-3 flex gap-3">
                      <span className={`shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${meta.badge}`} title={meta.label}>
                        {meta.icon}
                      </span>
                      <div className="min-w-0">
                        <div className="font-medium text-sm text-slate-900">{check.label}</div>
                        <div className="text-sm text-slate-600 break-words">{check.detail}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Decoded XML */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-700">Decoded XML</label>
                <CopyButton text={result.prettyXml} label="Copy XML" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
                <pre className="text-sm font-mono text-slate-900 whitespace-pre-wrap break-words max-h-96 overflow-auto">
                  {result.prettyXml}
                </pre>
              </div>
            </div>

            <p className="text-sm text-slate-500">
              Related: decode raw payloads with the{' '}
              <a href="/tools/saml-decoder" className="text-blue-600 hover:text-blue-800 underline">SAML Decoder</a>, inspect the signing cert with the{' '}
              <a href="/tools/saml-cert-inspector" className="text-blue-600 hover:text-blue-800 underline">SAML Certificate Inspector</a>, or build test responses with the{' '}
              <a href="/tools/saml-builder" className="text-blue-600 hover:text-blue-800 underline">SAML Assertion Builder</a>.
            </p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export default SamlValidator;
