'use client';

import { useMemo, useState } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import CopyButton from '../../shared/CopyButton';
import {
  encodeHTMLEntities,
  decodeHTMLEntities,
  DEFAULT_HTML_ENCODE_OPTIONS,
  type HTMLEncodeOptions,
} from '../../../utils/htmlEntities';

function HtmlEntityEncoder() {
  const [input, setInput] = useState('Café & tea – "naïve" résumé © 2026');
  const [escapeQuotes, setEscapeQuotes] = useState(true);
  const [escapeNonASCII, setEscapeNonASCII] = useState(true);

  const encodeOpts: HTMLEncodeOptions = { escapeQuotes, escapeNonASCII };
  const encoded = useMemo(() => encodeHTMLEntities(input, encodeOpts), [input, escapeQuotes, escapeNonASCII]);
  const decoded = useMemo(() => decodeHTMLEntities(input), [input]);

  return (
    <ToolLayout
      title="HTML Entity Encoder / Decoder"
      description="Encode text to HTML entities (named, decimal, and hex) and decode entities back to characters"
      fullWidth
    >
      <div className="space-y-4">
        {/* Options */}
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={escapeQuotes}
              onChange={(e) => setEscapeQuotes(e.target.checked)}
              className="rounded border-slate-300"
            />
            Escape quotes (&#34; &#39;)
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={escapeNonASCII}
              onChange={(e) => setEscapeNonASCII(e.target.checked)}
              className="rounded border-slate-300"
            />
            Escape non-ASCII to numeric entities
          </label>
        </div>

        {/* Input */}
        <TextArea
          value={input}
          onChange={setInput}
          label="Input"
          placeholder="Paste text to encode as HTML entities, or paste entities to decode"
          rows={8}
        />

        {/* Outputs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="block text-sm font-medium text-slate-700">Encoded</span>
              {encoded && <CopyButton text={encoded} label="Copy" />}
            </div>
            <pre className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-mono text-sm leading-6 text-slate-900 whitespace-pre-wrap break-words min-h-[160px]">
              {encoded || <span className="text-slate-400">(empty)</span>}
            </pre>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="block text-sm font-medium text-slate-700">Decoded</span>
              {decoded && <CopyButton text={decoded} label="Copy" />}
            </div>
            <pre className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-mono text-sm leading-6 text-slate-900 whitespace-pre-wrap break-words min-h-[160px]">
              {decoded || <span className="text-slate-400">(empty)</span>}
            </pre>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Decode handles named entities (the common HTML subset), decimal (<code>&amp;#169;</code>), and hex
          (<code>&amp;#x00A9;</code>) references. Encode uses numeric entities for non-ASCII — safe in all HTML/XML/SGML contexts.
        </p>
      </div>
    </ToolLayout>
  );
}

export default HtmlEntityEncoder;