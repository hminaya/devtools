'use client';

import { useMemo, useState } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import CopyButton from '../../shared/CopyButton';
import {
  sortAndDedup,
  type SortMode,
  type DedupMode,
  type SortDedupOptions,
} from '../../../utils/lineSorter';

function Pill<T extends string>({
  label,
  value,
  current,
  onSelect,
}: {
  label: string;
  value: T;
  current: T;
  onSelect: (v: T) => void;
}) {
  return (
    <button
      onClick={() => onSelect(value)}
      aria-pressed={current === value}
      className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
        current === value
          ? 'bg-blue-600 text-white border-blue-600'
          : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
      }`}
    >
      {label}
    </button>
  );
}

function LineSorter() {
  const [input, setInput] = useState('banana\napple\nApple\ncherry\n42\n7\nbanana\napple pie\n10.5\n');
  const [sortMode, setSortMode] = useState<SortMode>('lexical');
  const [dedupMode, setDedupMode] = useState<DedupMode>('case-insensitive');
  const [trimLines, setTrimLines] = useState(true);

  const opts: SortDedupOptions = { sortMode, dedupMode, trimLines };
  const result = useMemo(() => sortAndDedup(input, opts), [input, opts]);
  const originalLines = input === '' ? 0 : input.split(/\r\n|\r|\n/).filter((l) => l.trim().length > 0).length;
  const removedCount = originalLines - result.length;

  return (
    <ToolLayout
      title="Line Sorter & Deduplicator"
      description="Sort lines alphabetically, numerically, or by length, with optional deduplication and trimming"
      fullWidth
    >
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1" role="group" aria-label="Sort order">
            <span className="text-xs text-slate-500 mr-1">Sort:</span>
            <Pill label="Aa→Zz" value="lexical" current={sortMode} onSelect={setSortMode} />
            <Pill label="Numeric" value="numeric" current={sortMode} onSelect={setSortMode} />
            <Pill label="Length" value="length" current={sortMode} onSelect={setSortMode} />
            <Pill label="None" value="none" current={sortMode} onSelect={setSortMode} />
          </div>
          <div className="flex items-center gap-1" role="group" aria-label="Deduplicate">
            <span className="text-xs text-slate-500 mr-1">Dedup:</span>
            <Pill label="Case-insens." value="case-insensitive" current={dedupMode} onSelect={setDedupMode} />
            <Pill label="Exact" value="exact" current={dedupMode} onSelect={setDedupMode} />
            <Pill label="Trim" value="trim" current={dedupMode} onSelect={setDedupMode} />
            <Pill label="Off" value="none" current={dedupMode} onSelect={setDedupMode} />
          </div>
          <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={trimLines}
              onChange={(e) => setTrimLines(e.target.checked)}
              className="rounded"
            />
            Trim each line
          </label>
        </div>

        {/* Stats */}
        {input.trim() && (
          <div aria-live="polite" className="flex flex-wrap gap-3 text-xs text-slate-600">
            <span className="px-2.5 py-1 rounded-full bg-slate-100">Original: {originalLines}</span>
            <span className="px-2.5 py-1 rounded-full bg-slate-100">Output: {result.length}</span>
            {removedCount > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-700">Removed: {removedCount}</span>
            )}
          </div>
        )}

        {/* Two-column editor */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TextArea
            value={input}
            onChange={setInput}
            label="Input"
            placeholder="One item per line"
            rows={20}
          />
          <div>
            <TextArea
              value={result.join('\n')}
              label="Output"
              readOnly
              rows={20}
            />
            {result.length > 0 && <CopyButton text={result.join('\n')} label="Copy Output" />}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}

export default LineSorter;