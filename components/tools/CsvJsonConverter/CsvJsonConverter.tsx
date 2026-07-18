'use client';

import { useState } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import CodeDisplay from '../../shared/CodeDisplay';
import {
  convert,
  SAMPLES,
  type ConvertOptions,
  type DataFormat,
  type DelimiterChoice,
  type Indent,
} from '../../../utils/csvJson';

const FORMAT_BADGE: Record<DataFormat, { label: string; class: string }> = {
  csv: { label: 'CSV', class: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  json: { label: 'JSON', class: 'bg-blue-100 text-blue-700 border-blue-200' },
  unknown: { label: 'Unknown', class: 'bg-slate-100 text-slate-500 border-slate-200' },
};

const DELIMITER_OPTIONS: { value: DelimiterChoice; label: string }[] = [
  { value: 'auto', label: 'Auto' },
  { value: ',', label: 'Comma' },
  { value: ';', label: 'Semicolon' },
  { value: '\t', label: 'Tab' },
  { value: '|', label: 'Pipe' },
];

export default function CsvJsonConverter() {
  const [input, setInput] = useState('');
  const [manualFormat, setManualFormat] = useState<'auto' | 'csv' | 'json'>('auto');
  const [delimiter, setDelimiter] = useState<DelimiterChoice>('auto');
  const [header, setHeader] = useState(true);
  const [typeInference, setTypeInference] = useState(true);
  const [flatten, setFlatten] = useState(true);
  const [indent, setIndent] = useState<Indent>(2);
  const [sampleIndex, setSampleIndex] = useState(0);

  const options: ConvertOptions = {
    manualFormat,
    delimiter,
    header,
    typeInference,
    flatten,
    indent,
  };

  const result = input.trim()
    ? convert(input, options)
    : { output: '', detectedFormat: 'unknown' as DataFormat, outputFormat: 'json' as const };

  const badge = FORMAT_BADGE[result.detectedFormat];

  // Which direction are we converting? Drives which option controls are relevant.
  const effectiveFormat =
    manualFormat === 'auto' ? result.detectedFormat : manualFormat;
  const csvToJson = effectiveFormat === 'csv';
  const jsonToCsv = effectiveFormat === 'json';

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

  const arrowLabel =
    effectiveFormat === 'unknown'
      ? 'CSV ↔ JSON'
      : effectiveFormat === 'json'
        ? 'JSON → CSV'
        : 'CSV → JSON';

  return (
    <ToolLayout
      title="CSV ↔ JSON Converter"
      description="Convert between CSV and JSON with auto-detection, delimiter handling, type inference, and nested-object flattening"
      fullWidth
    >
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Format override */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-500 mr-1">Input format:</span>
            {(['auto', 'csv', 'json'] as const).map((f) => (
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
                {f === 'auto' ? 'Auto' : f.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Delimiter (relevant whenever CSV is on either side) */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-500 mr-1">Delimiter:</span>
            {DELIMITER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                aria-pressed={delimiter === opt.value}
                onClick={() => setDelimiter(opt.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                  delimiter === opt.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* JSON indent (only when producing JSON) */}
          {csvToJson && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-500 mr-1">JSON indent:</span>
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

        {/* Checkbox options */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {csvToJson && (
            <>
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={header}
                  onChange={(e) => setHeader(e.target.checked)}
                  className="rounded border-slate-300"
                />
                First row is header
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={typeInference}
                  onChange={(e) => setTypeInference(e.target.checked)}
                  className="rounded border-slate-300"
                />
                Infer numbers / booleans / null
              </label>
            </>
          )}
          {jsonToCsv && (
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={flatten}
                onChange={(e) => setFlatten(e.target.checked)}
                className="rounded border-slate-300"
              />
              Flatten nested objects (dot notation)
            </label>
          )}
        </div>

        {/* Conversion direction indicator */}
        {input.trim() && (
          <div role="status" className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${badge.class}`}
            >
              {badge.label} detected
            </span>
            <span className="text-slate-400 text-sm font-medium">{arrowLabel}</span>
            {result.rowCount !== undefined && !result.error && (
              <span className="text-slate-400 text-sm">
                · {result.rowCount} {result.rowCount === 1 ? 'row' : 'rows'}
              </span>
            )}
          </div>
        )}

        {/* Two-column editor */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <TextArea
              label="Input"
              value={input}
              onChange={setInput}
              placeholder="Paste CSV or JSON here..."
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
              <div role="alert" className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-700 text-sm">{result.error}</p>
              </div>
            ) : result.output ? (
              <CodeDisplay
                code={result.output}
                language={result.outputFormat === 'json' ? 'json' : 'text'}
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
