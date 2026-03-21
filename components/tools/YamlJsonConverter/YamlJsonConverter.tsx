'use client';

import { useState, useEffect } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import CodeDisplay from '../../shared/CodeDisplay';
import { convert, SAMPLES, type InputFormat, type Indent } from '../../../utils/yamlJson';

const FORMAT_BADGE: Record<InputFormat, { label: string; class: string }> = {
  yaml: { label: 'YAML', class: 'bg-purple-100 text-purple-700 border-purple-200' },
  json: { label: 'JSON', class: 'bg-blue-100 text-blue-700 border-blue-200' },
  unknown: { label: 'Unknown', class: 'bg-slate-100 text-slate-500 border-slate-200' },
};

const OUTPUT_LANGUAGE: Record<string, string> = {
  yaml: 'yaml',
  json: 'json',
};

export default function YamlJsonConverter() {
  const [input, setInput] = useState('');
  const [manualFormat, setManualFormat] = useState<'auto' | 'yaml' | 'json'>('auto');
  const [indent, setIndent] = useState<Indent>(2);
  const [sampleIndex, setSampleIndex] = useState(0);

  const result = input.trim()
    ? convert(input, manualFormat, indent)
    : { output: '', detectedFormat: 'unknown' as InputFormat, outputFormat: 'json' as const };

  const badge = FORMAT_BADGE[result.detectedFormat];

  const handleLoadSample = () => {
    const sample = SAMPLES[sampleIndex % SAMPLES.length]!;
    setInput(sample.value);
    setManualFormat('auto');
    setSampleIndex((i) => i + 1);
  };

  const handleClear = () => {
    setInput('');
    setManualFormat('auto');
  };

  const arrowLabel = result.detectedFormat === 'unknown'
    ? 'YAML ↔ JSON'
    : result.detectedFormat === 'json'
      ? 'JSON → YAML'
      : 'YAML → JSON';

  return (
    <ToolLayout
      title="YAML ↔ JSON Converter"
      description="Convert between YAML and JSON with auto-detection of input format"
      fullWidth
    >
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Format override */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-500 mr-1">Input format:</span>
            {(['auto', 'yaml', 'json'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setManualFormat(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                  manualFormat === f
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* JSON indent (only shown when output will be JSON) */}
          {(result.detectedFormat === 'yaml' || (result.detectedFormat === 'unknown' && manualFormat === 'yaml')) && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-500 mr-1">JSON indent:</span>
              {([2, 4] as Indent[]).map((n) => (
                <button
                  key={n}
                  onClick={() => setIndent(n)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                    indent === n
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {n} spaces
                </button>
              ))}
            </div>
          )}

          <div className="flex-1" />
          <Button label="Load Sample" onClick={handleLoadSample} variant="secondary" />
          <Button label="Clear" onClick={handleClear} variant="secondary" />
        </div>

        {/* Conversion direction indicator */}
        {input.trim() && (
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${badge.class}`}>
              {badge.label} detected
            </span>
            <span className="text-slate-400 text-sm font-medium">{arrowLabel}</span>
          </div>
        )}

        {/* Two-column editor */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <TextArea
              label="Input"
              value={input}
              onChange={setInput}
              placeholder="Paste YAML or JSON here..."
              rows={20}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Output
                {result.output && (
                  <span className="ml-2 text-xs font-normal text-slate-400">
                    ({result.outputFormat.toUpperCase()})
                  </span>
                )}
              </label>
              {result.output && <CopyButton text={result.output} label="Copy" />}
            </div>

            {result.error ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-700 text-sm">{result.error}</p>
              </div>
            ) : result.output ? (
              <CodeDisplay
                code={result.output}
                language={OUTPUT_LANGUAGE[result.outputFormat] ?? 'text'}
              />
            ) : (
              <div className="border border-dashed border-slate-300 rounded-md p-8 text-center text-slate-400 text-sm">
                Output will appear here
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
