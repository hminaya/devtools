'use client';

import { useState } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import { generateHMAC, type HMACAlgorithm } from '../../../utils/hmac';

const ALGORITHMS: { value: HMACAlgorithm; label: string }[] = [
  { value: 'SHA-1',   label: 'SHA-1 (160 bits)' },
  { value: 'SHA-256', label: 'SHA-256 (256 bits)' },
  { value: 'SHA-384', label: 'SHA-384 (384 bits)' },
  { value: 'SHA-512', label: 'SHA-512 (512 bits)' },
];

function HmacGenerator() {
  const [message, setMessage] = useState('the quick brown fox jumps over the lazy dog');
  const [secret, setSecret] = useState('shh-secret-key');
  const [algorithm, setAlgorithm] = useState<HMACAlgorithm>('SHA-256');
  const [result, setResult] = useState<{ hex: string; base64: string; base64url: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generate = async () => {
    if (!message || !secret) return;
    setIsGenerating(true);
    try {
      const out = await generateHMAC(message, secret, algorithm);
      setResult(out);
    } finally {
      setIsGenerating(false);
    }
  };

  const clear = () => {
    setMessage('');
    setSecret('');
    setResult(null);
  };

  return (
    <ToolLayout
      title="HMAC Generator"
      description="Generate HMAC (Hash-based Message Authentication Code) signatures with SHA-1, SHA-256, SHA-384, or SHA-512 — output as hex, base64, or base64url"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <Button
            label={isGenerating ? 'Generating...' : 'Generate HMAC'}
            onClick={generate}
            variant="primary"
          />
          <Button label="Clear" onClick={clear} variant="secondary" />

          <div className="flex items-center gap-2 ml-auto">
            <label className="text-sm font-medium text-slate-700">Algorithm:</label>
            <select
              aria-label="Algorithm"
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value as HMACAlgorithm)}
              className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {ALGORITHMS.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-blue-800 text-sm">
            <strong>HMAC</strong> (Hash-based Message Authentication Code) provides both integrity and
            authenticity by combining a cryptographic hash with a shared secret key. The result proves
            the message originated from someone with the secret, and was not modified in transit.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TextArea
            value={message}
            onChange={setMessage}
            label="Message"
            placeholder="Paste the message to authenticate"
            rows={10}
          />
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">
              Secret key
            </label>
            <input
              type="password"
              aria-label="Secret key"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Shared secret"
              className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-slate-400">
              The secret is kept in your browser only — all HMAC computation happens locally via Web Crypto.
            </p>
          </div>
        </div>

        {result && (
          <div className="space-y-3" aria-live="polite">
            <h3 className="text-sm font-semibold text-slate-800">{algorithm} HMAC</h3>
            {(['hex', 'base64', 'base64url'] as const).map((enc) => (
              <div key={enc} className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-baseline justify-between gap-3 mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{enc}</span>
                  <span className="text-xs text-slate-400">{result[enc].length} chars</span>
                </div>
                <div className="flex items-start gap-3">
                  <code className="flex-1 font-mono text-sm text-slate-900 break-all">{result[enc]}</code>
                  <CopyButton text={result[enc]} label={`Copy ${enc}`} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export default HmacGenerator;