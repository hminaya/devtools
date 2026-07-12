'use client';

import { useMemo, useState } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import CopyButton from '../../shared/CopyButton';
import {
  escapeUnicode,
  unescapeUnicode,
  type UnicodeEscapeOptions,
} from '../../../utils/unicodeEscape';

function UnicodeEscape() {
  const [input, setInput] = useState('Hello, 世界! 🌍 Café — naïve\nNew line.');
  const [escapeAll, setEscapeAll] = useState(true);
  const [useES6Braces, setUseES6Braces] = useState(true);

  const opts: UnicodeEscapeOptions = { escapeAll, useES6Braces };
  const escaped = useMemo(() => escapeUnicode(input, opts), [input, escapeAll, useES6Braces]);
  const unescaped = useMemo(() => unescapeUnicode(input), [input]);

  return (
    <ToolLayout
      title="Unicode Escape / Unescape"
      description="Convert text to \\uXXXX / \\u{XXXXX} Unicode escapes and back, with support for surrogate pairs and standard JSON-style escapes"
      fullWidth
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={escapeAll}
              onChange={(e) => setEscapeAll(e.target.checked)}
              className="rounded border-slate-300"
            />
            Also escape control chars (\n, \t, \r, \b, \f, \0)
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useES6Braces}
              onChange={(e) => setUseES6Braces(e.target.checked)}
              className="rounded border-slate-300"
            />
            Use ES6 <code>{'\\u{XXXXX}'}</code> for supplementary plane (emoji)
          </label>
        </div>

        <TextArea
          value={input}
          onChange={setInput}
          label="Input"
          placeholder="Paste text with non-ASCII chars (or pre-escaped \\uXXXX strings)"
          rows={8}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-slate-700">Escaped</label>
              {escaped && <CopyButton text={escaped} label="Copy" />}
            </div>
            <pre className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-mono text-sm leading-6 text-slate-900 whitespace-pre-wrap break-words min-h-[160px]">
              {escaped || <span className="text-slate-400">(empty)</span>}
            </pre>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-slate-700">Unescaped</label>
              {unescaped.output && <CopyButton text={unescaped.output} label="Copy" />}
            </div>
            {unescaped.error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {unescaped.error}
              </div>
            ) : (
              <pre className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-mono text-sm leading-6 text-slate-900 whitespace-pre-wrap break-words min-h-[160px]">
                {unescaped.output || <span className="text-slate-400">(empty)</span>}
              </pre>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Unescape handles <code>{'\\uXXXX'}</code>, <code>{'\\u{XXXXX}'}</code>, <code>{'\\xXX'}</code>,
          <code>\n \t \r \b \f \0 \\ \"</code> (JSON-style). Emoji and other supplementary-plane
          characters are encoded as surrogate pairs or the ES6 braced form depending on the option.
        </p>
      </div>
    </ToolLayout>
  );
}

export default UnicodeEscape;