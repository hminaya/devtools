'use client';

import { useMemo, useState } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import CopyButton from '../../shared/CopyButton';
import {
  ESCAPE_CONTEXT_LABELS,
  escapeString,
  unescapeString,
  type EscapeContext,
} from '../../../utils/stringEscape';

function StringEscape() {
  const [input, setInput] = useState('hello & "world" <tag>123</tag>\nnew line');
  const [ctx, setCtx] = useState<EscapeContext>('xml');

  const escaped = useMemo(() => escapeString(input, ctx), [input, ctx]);
  const unescaped = useMemo(() => unescapeString(input, ctx), [input, ctx]);

  return (
    <ToolLayout
      title="String Escape / Unescape"
      description="Escape and unescape text for JSON, XML, CSV, regex, or POSIX shell contexts"
      fullWidth
    >
      <div className="space-y-4">
        {/* Context selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500">Context:</span>
          {ESCAPE_CONTEXT_LABELS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setCtx(opt.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors capitalize ${
                ctx === opt.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
          <div className="flex-1" />
          <button
            onClick={() => setInput(unescapeString(escaped, ctx).output ?? escaped)}
            className="px-3 py-1.5 rounded-md text-xs font-medium border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
          >
            Use escaped as input
          </button>
        </div>

        {/* Input */}
        <TextArea
          value={input}
          onChange={setInput}
          label="Input"
          placeholder="Paste text to escape or unescape — both directions update live"
          rows={8}
        />

        {/* Output grids */}
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
          Both directions update live from the same input. Useful for safely embedding text inside
          JSON payloads, XML/HTML attributes, CSV columns, regex literals, or shell commands.
        </p>
      </div>
    </ToolLayout>
  );
}

export default StringEscape;