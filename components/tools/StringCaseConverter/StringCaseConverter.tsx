'use client';

import { useMemo, useState } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import CopyButton from '../../shared/CopyButton';
import { CASE_OPTIONS, toAllCases, type CaseName } from '../../../utils/stringCase';

function StringCaseConverter() {
  const [input, setInput] = useState('Hello World! This_isA mixed-format string.');

  const all = useMemo(() => toAllCases(input), [input]);

  return (
    <ToolLayout
      title="String Case Converter"
      description="Convert text between camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, and more"
      fullWidth
    >
      <div className="space-y-4">
        {/* Input */}
        <TextArea
          value={input}
          onChange={setInput}
          label="Input"
          placeholder="Paste any text — camelCase, snake_case, SCREAMING_SNAKE, sentences, etc."
          rows={5}
        />

        {/* Results grid — each case as a copyable row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CASE_OPTIONS.map((opt) => (
            <div
              key={opt.value}
              className="group rounded-xl border border-slate-200 bg-white p-4 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-baseline justify-between gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {opt.label}
                </span>
                <span className="text-xs text-slate-400 font-mono">e.g. {opt.example}</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 min-w-0 font-mono text-sm text-slate-900 break-all">
                  {all[opt.value as CaseName] || <span className="text-slate-300">—</span>}
                </code>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <CopyButton text={all[opt.value as CaseName] ?? ''} label="" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-500">
          {CASE_OPTIONS.length} case formats. Inputs are tokenized using camel boundaries, separators
          (<code>_ - . /</code>), and letter↔number transitions so any mixed source string produces clean output.
        </p>
      </div>
    </ToolLayout>
  );
}

export default StringCaseConverter;