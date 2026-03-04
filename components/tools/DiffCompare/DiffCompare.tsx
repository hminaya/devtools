'use client';

import { useState } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import { computeLineDiff, type DiffResult } from '../../../utils/textDiff';

function DiffCompare() {
  const [original, setOriginal] = useState('');
  const [modified, setModified] = useState('');
  const [result, setResult] = useState<DiffResult | null>(null);

  const compare = () => {
    if (!original && !modified) return;
    setResult(computeLineDiff(original, modified));
  };

  const clear = () => {
    setOriginal('');
    setModified('');
    setResult(null);
  };

  const swap = () => {
    setOriginal(modified);
    setModified(original);
    setResult(null);
  };

  const diffText = result
    ? result.lines
        .map((l) => {
          const prefix = l.type === 'added' ? '+' : l.type === 'removed' ? '-' : ' ';
          return `${prefix} ${l.text}`;
        })
        .join('\n')
    : '';

  return (
    <ToolLayout
      title="Diff / Text Compare"
      description="Compare two texts and see a color-coded diff of the changes"
      fullWidth
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <Button label="Compare" onClick={compare} variant="primary" />
          <Button label="Swap" onClick={swap} variant="secondary" />
          <Button label="Clear" onClick={clear} variant="secondary" />
          {diffText && <CopyButton text={diffText} label="Copy Diff" />}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <TextArea
            value={original}
            onChange={setOriginal}
            label="Original"
            placeholder="Paste original text here..."
            rows={16}
          />
          <TextArea
            value={modified}
            onChange={setModified}
            label="Modified"
            placeholder="Paste modified text here..."
            rows={16}
          />
        </div>

        {result && (
          <>
            <div className="flex gap-4 text-sm font-medium">
              <span className="text-green-700">+{result.stats.added} added</span>
              <span className="text-red-700">-{result.stats.removed} removed</span>
              <span className="text-slate-500">{result.stats.unchanged} unchanged</span>
            </div>

            <div className="border border-slate-300 rounded-md overflow-hidden">
              <pre className="text-sm font-mono" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {result.lines.map((line, index) => {
                  const bg =
                    line.type === 'added'
                      ? 'bg-green-50'
                      : line.type === 'removed'
                        ? 'bg-red-50'
                        : '';
                  const textColor =
                    line.type === 'added'
                      ? 'text-green-800'
                      : line.type === 'removed'
                        ? 'text-red-800'
                        : 'text-slate-700';
                  const prefix = line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' ';

                  return (
                    <div key={index} className={`flex ${bg}`}>
                      <span className="w-10 shrink-0 text-right pr-2 text-slate-400 select-none border-r border-slate-200 py-0.5">
                        {line.lineNumber}
                      </span>
                      <span className={`w-5 shrink-0 text-center select-none py-0.5 ${textColor} font-semibold`}>
                        {prefix}
                      </span>
                      <span className={`flex-1 px-2 py-0.5 whitespace-pre-wrap break-all ${textColor}`}>
                        {line.text}
                      </span>
                    </div>
                  );
                })}
              </pre>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
}

export default DiffCompare;
