'use client';

import { useState, useEffect } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import CodeDisplay from '../../shared/CodeDisplay';
import { convert, formatYaml, SAMPLES, type InputFormat, type Indent } from '../../../utils/yamlJson';

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
  const [mode, setMode] = useState<'convert' | 'format'>('convert');
  const [manualFormat, setManualFormat] = useState<'auto' | 'yaml' | 'json'>('auto');
  const [indent, setIndent] = useState<Indent>(2);
  const [sampleIndex, setSampleIndex] = useState(0);

  const convertResult = input.trim()
    ? convert(input, manualFormat, indent)
    : { output: '', detectedFormat: 'unknown' as InputFormat, outputFormat: 'json' as const };
  const formatResult = mode === 'format' && input.trim() ? formatYaml(input, indent) : null;

  const badge = FORMAT_BADGE[convertResult.detectedFormat];

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

  const arrowLabel = convertResult.detectedFormat === 'unknown'
    ? 'YAML ↔ JSON'
    : convertResult.detectedFormat === 'json'
      ? 'JSON → YAML'
      : 'YAML → JSON';

  const output = mode === 'format'
    ? (formatResult?.valid ? formatResult.output ?? '' : '')
    : convertResult.output;
  const outputLanguage = mode === 'format' ? 'yaml' : (OUTPUT_LANGUAGE[convertResult.outputFormat] ?? 'text');
  const outputError = mode === 'format'
    ? (formatResult && !formatResult.valid ? formatResult.error : null)
    : convertResult.error;

  return (
    <ToolLayout
      title="YAML/JSON Converter & Formatter"
      description="Convert between YAML and JSON, or format and validate standalone YAML"
      fullWidth
    >
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Mode toggle */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-500 mr-1">Mode:</span>
            {(['convert', 'format'] as const).map((m) => (
              <button
                key={m}
                aria-pressed={mode === m}
                onClick={() => setMode(m)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors capitalize ${
                  mode === m
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {m === 'format' ? 'Format YAML' : 'Convert YAML ↔ JSON'}
              </button>
            ))}
          </div>

          {mode === 'convert' && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-500 mr-1">Input format:</span>
              {(['auto', 'yaml', 'json'] as const).map((f) => (
                <button
                  key={f}
                  aria-pressed={manualFormat === f}
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
          )}

          {/* Indent selector: shown for YAML→JSON conversion OR for Format YAML mode */}
          {(mode === 'format' ||
            (mode === 'convert' &&
              (convertResult.detectedFormat === 'yaml' ||
                (convertResult.detectedFormat === 'unknown' && manualFormat === 'yaml')))) && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-500 mr-1">
                {mode === 'format' ? 'Indent:' : 'JSON indent:'}
              </span>
              {([2, 4] as Indent[]).map((n) => (
                <button
                  key={n}
                  aria-pressed={indent === n}
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

        {/* Status / direction indicator */}
        {input.trim() && (
          <div role="status" className="flex items-center gap-2">
            {mode === 'convert' ? (
              <>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${badge.class}`}>
                  {badge.label} detected
                </span>
                <span className="text-slate-400 text-sm font-medium">{arrowLabel}</span>
              </>
            ) : formatResult ? (
              formatResult.valid ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-green-100 text-green-700 border-green-200">
                  Valid YAML — formatted
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-red-100 text-red-700 border-red-200">
                  Invalid YAML
                </span>
              )
            ) : null}
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
                {output && (
                  <span className="ml-2 text-xs font-normal text-slate-400">
                    ({mode === 'format' ? 'YAML' : convertResult.outputFormat.toUpperCase()})
                  </span>
                )}
              </label>
              {output && <CopyButton text={output} label="Copy" />}
            </div>

            {outputError ? (
              <div role="alert" className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-700 text-sm">{outputError}</p>
              </div>
            ) : output ? (
              <CodeDisplay
                code={output}
                language={outputLanguage}
              />
            ) : (
              <div className="border border-dashed border-slate-300 rounded-md p-8 text-center text-slate-400 text-sm">
                {mode === 'format'
                  ? 'Formatted YAML will appear here'
                  : 'Output will appear here'}
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
