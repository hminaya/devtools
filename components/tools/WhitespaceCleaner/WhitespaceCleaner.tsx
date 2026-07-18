'use client';

import { useMemo, useState } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import CopyButton from '../../shared/CopyButton';
import {
  visualizeWhitespace,
  analyzeWhitespace,
  cleanWhitespace,
  DEFAULT_CLEAN_OPTIONS,
  type CleanOptions,
} from '../../../utils/whitespace';

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-slate-300"
      />
      {label}
    </label>
  );
}

function WhitespaceCleaner() {
  const [input, setInput] = useState('  hello\tworld  \n\n   multiple   spaces   \n  trailing ws   \n');
  const [opts, setOpts] = useState<CleanOptions>({ ...DEFAULT_CLEAN_OPTIONS });

  const stats = useMemo(() => analyzeWhitespace(input), [input]);
  const visualized = useMemo(() => visualizeWhitespace(input), [input]);
  const cleaned = useMemo(() => cleanWhitespace(input, opts), [input, opts]);

  const update = <K extends keyof CleanOptions>(key: K, value: CleanOptions[K]) =>
    setOpts((o) => ({ ...o, [key]: value }));

  return (
    <ToolLayout
      title="Whitespace Visualizer & Cleaner"
      description="Spot invisible whitespace (tabs, NBSP, zero-width, trailing space) and batch-clean with multiple options"
      fullWidth
    >
      <div className="space-y-4">
        {/* Stats */}
        <div aria-live="polite" className="flex flex-wrap gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-slate-100">Spaces: {stats.spaces}</span>
          <span className="px-2.5 py-1 rounded-full bg-slate-100">Tabs: {stats.tabs}</span>
          <span className="px-2.5 py-1 rounded-full bg-slate-100">Newlines: {stats.newlines}</span>
          <span className="px-2.5 py-1 rounded-full bg-slate-100">NBSP: {stats.nbsp}</span>
          <span className="px-2.5 py-1 rounded-full bg-slate-100">Zero-width: {stats.zeroWidth}</span>
          <span className="px-2.5 py-1 rounded-full bg-slate-100">Other WS: {stats.otherWhitespace}</span>
          <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800">
            Lines with trailing whitespace: {stats.trailingWhitespaceLines}
          </span>
        </div>

        {/* Input */}
        <TextArea
          value={input}
          onChange={setInput}
          label="Input"
          placeholder="Paste text with mixed whitespace"
          rows={8}
        />

        {/* Visualization */}
        <div aria-live="polite">
          <label className="block text-sm font-medium text-slate-700 mb-1">Visualized whitespace</label>
          <pre className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 font-mono text-sm leading-6 text-slate-900 whitespace-pre-wrap break-words min-h-[120px]">
            {visualized || <span className="text-slate-400">(empty)</span>}
          </pre>
          <p className="text-xs text-slate-400 mt-1">
            <b>·</b> space · <b>→</b> tab · <b>⏎</b> newline · <b>⍽</b> NBSP · <b>⊙</b> BOM · <b>□</b> ideographic space
          </p>
        </div>

        {/* Cleaning options */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
          <h3 className="text-sm font-semibold text-slate-800">Cleanup options</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            <Toggle label="Trim each line" checked={opts.trimLines} onChange={(v) => update('trimLines', v)} />
            <Toggle label="Collapse spaces (runs → 1)" checked={opts.collapseSpaces} onChange={(v) => update('collapseSpaces', v)} />
            <Toggle label="Tabs → spaces" checked={opts.tabsToSpaces} onChange={(v) => update('tabsToSpaces', v)} />
            <Toggle label="Remove blank lines" checked={opts.removeBlankLines} onChange={(v) => update('removeBlankLines', v)} />
            <Toggle label="Collapse blank runs (1 max)" checked={opts.collapseBlankRuns} onChange={(v) => update('collapseBlankRuns', v)} />
            <Toggle label="Trim document (leading/trailing blanks)" checked={opts.trimDocument} onChange={(v) => update('trimDocument', v)} />
            <Toggle label="Normalize to LF (CRLF/CR → LF)" checked={opts.normalizeLineEndings} onChange={(v) => update('normalizeLineEndings', v)} />
          </div>
        </div>

        {/* Cleaned output */}
        <div aria-live="polite">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-slate-700">Cleaned output</label>
            {cleaned && <CopyButton text={cleaned} label="Copy" />}
          </div>
          <TextArea value={cleaned} readOnly rows={8} />
        </div>
      </div>
    </ToolLayout>
  );
}

export default WhitespaceCleaner;