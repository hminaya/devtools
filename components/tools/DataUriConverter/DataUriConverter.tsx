'use client';

import { useState } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import CopyButton from '../../shared/CopyButton';
import { textToDataUri, decodeDataUri, isTextMime } from '../../../utils/dataUri';

function DataUriConverter() {
  const [text, setText] = useState('Hello, world!');
  const [mimeType, setMimeType] = useState('text/plain');
  const [dataUri, setDataUri] = useState('');
  const [decoded, setDecoded] = useState('');
  const [decodedMeta, setDecodedMeta] = useState<{ mimeType: string; isBase64: boolean; charset?: string; sizeBytes: number } | null>(null);
  const [error, setError] = useState('');

  const handleEncode = () => {
    setError('');
    try {
      const uri = textToDataUri(text, mimeType || 'text/plain');
      setDataUri(uri);
      setDecoded('');
      setDecodedMeta(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to encode');
    }
  };

  const handleDecode = () => {
    setError('');
    setDecoded('');
    setDecodedMeta(null);
    if (!text.trim()) {
      setError('Paste a data URI to decode');
      return;
    }
    const r = decodeDataUri(text);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    setDecodedMeta({
      mimeType: r.info.mimeType,
      isBase64: r.info.isBase64,
      charset: r.info.charset,
      sizeBytes: r.info.sizeBytes,
    });
    if (isTextMime(r.info.mimeType)) {
      setDecoded(r.info.data);
    } else {
      setDecoded(`(Binary content — ${r.info.sizeBytes} bytes)`);
    }
  };

  return (
    <ToolLayout
      title="Data URI Converter"
      description="Convert text to a data: URI with UTF-8 Base64 encoding, or decode a data: URI back to text or bytes — handles any MIME type"
      fullWidth
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={mimeType}
            onChange={(e) => setMimeType(e.target.value)}
            placeholder="MIME type (text/plain)"
            className="w-64 px-3 py-2 border border-slate-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleEncode}
            className="px-3 py-1.5 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 border border-blue-600"
          >
            Encode Text → data URI
          </button>
          <button
            onClick={handleDecode}
            className="px-3 py-1.5 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 border border-green-600"
          >
            Decode data URI → Text
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-700 text-sm">{error}</div>
        )}

        <TextArea
          value={text}
          onChange={setText}
          label="Input (text to encode OR a data: URI to decode)"
          rows={8}
          placeholder="Type text or paste a data: URL"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-slate-700">Encoded data URI</label>
              {dataUri && <CopyButton text={dataUri} label="Copy" />}
            </div>
            <pre className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-mono text-sm leading-6 text-slate-900 whitespace-pre-wrap break-words min-h-[160px]">
              {dataUri || <span className="text-slate-400">(encoded URI will appear here)</span>}
            </pre>
            {dataUri && (
              <p className="text-xs text-slate-500 mt-1">{dataUri.length} chars</p>
            )}
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-slate-700">Decoded content</label>
              {decoded && <CopyButton text={decoded} label="Copy" />}
            </div>
            <pre className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-mono text-sm leading-6 text-slate-900 whitespace-pre-wrap break-words min-h-[160px]">
              {decoded || <span className="text-slate-400">(decoded content will appear here)</span>}
            </pre>
            {decodedMeta && (
              <p className="text-xs text-slate-500 mt-1">
                {decodedMeta.mimeType}
                {decodedMeta.charset ? `; charset=${decodedMeta.charset}` : ''}
                {decodedMeta.isBase64 ? ' (base64)' : ' (percent-encoded)'}
                {' · '}
                {decodedMeta.sizeBytes} bytes
              </p>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-500">
          A <code>data:</code> URI embeds arbitrary resource bytes inline. Text is encoded as UTF-8 then
          Base64, producing self-contained values safe for HTML <code>src=</code> attributes,
          CSS <code>url()</code> references, and JSON.
        </p>
      </div>
    </ToolLayout>
  );
}

export default DataUriConverter;