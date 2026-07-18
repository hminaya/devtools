'use client';

import { useState } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';

function Base64EncoderDecoder() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const bytesToBase64 = (bytes: Uint8Array) => {
    let binary = '';
    const chunkSize = 0x8000;

    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }

    return btoa(binary);
  };

  const base64ToBytes = (base64: string) => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    return bytes;
  };

  const encode = () => {
    try {
      const encoded = bytesToBase64(new TextEncoder().encode(input));
      setOutput(encoded);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to encode. Make sure the input is valid text.');
      setOutput('');
    }
  };

  const decode = () => {
    try {
      const decoded = new TextDecoder('utf-8', { fatal: true }).decode(base64ToBytes(input));
      setOutput(decoded);
      setError('');
    } catch (err) {
      setError('Invalid Base64 string or decoded data is not valid UTF-8 text. Please check your input.');
      setOutput('');
    }
  };

  const clear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  const generateSample = () => {
    const sample = 'Hello, World! Base64 supports Unicode text like café, こんにちは, and 🚀.';
    setInput(sample);
    setOutput('');
    setError('');
  };

  return (
    <ToolLayout
      title="Base64 Encoder/Decoder"
      description="Encode text to Base64 or decode Base64 strings"
      fullWidth
    >
      <div className="space-y-4">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button label="Encode to Base64" onClick={encode} variant="primary" />
          <Button label="Decode from Base64" onClick={decode} variant="primary" />
          <Button label="Generate Sample" onClick={generateSample} variant="secondary" />
          <Button label="Clear" onClick={clear} variant="secondary" />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4" role="alert">
            <p className="text-red-700 font-medium">Error:</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Side by Side Input/Output */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Input Column */}
          <div className="space-y-2">
            <TextArea
              value={input}
              onChange={setInput}
              label="Input"
              placeholder="Enter text to encode or Base64 to decode"
              rows={30}
            />
          </div>

          {/* Output Column */}
          <div className="space-y-2">
            <TextArea
              value={output}
              label="Output"
              readOnly
              rows={30}
            />
            {output && <CopyButton text={output} label="Copy Output" />}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}

export default Base64EncoderDecoder;
