'use client';

import { useState, useEffect } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import { encodeUrl, decodeUrl, buildDiffSegments, SAMPLES, type DiffSegment } from '../../../utils/urlEncoder';

function DiffDisplay({ segments }: { segments: DiffSegment[] }) {
  return (
    <div className="p-3 bg-gray-50 border border-gray-200 rounded-md font-mono text-xs break-all leading-relaxed whitespace-pre-wrap">
      {segments.map((seg, i) =>
        seg.encoded ? (
          <mark key={i} className="bg-amber-200 text-amber-900 rounded px-0.5 not-italic">
            {seg.text}
          </mark>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </div>
  );
}

interface OutputCardProps {
  label: string;
  sublabel: string;
  value: string;
  error?: string;
  showDiff?: boolean;
}

function OutputCard({ label, sublabel, value, error, showDiff }: OutputCardProps) {
  const segments = showDiff && value ? buildDiffSegments(value) : [];

  return (
    <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-800">{label}</p>
          <p className="text-xs text-slate-500">{sublabel}</p>
        </div>
        {value && !error && <CopyButton text={value} label="Copy" />}
      </div>

      {error ? (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </div>
      ) : value ? (
        <>
          <div className="font-mono text-xs text-slate-800 bg-white border border-slate-200 rounded p-3 break-all whitespace-pre-wrap max-h-40 overflow-y-auto">
            {value}
          </div>
          {showDiff && segments.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 mb-1">Highlighted changes <span className="inline-block bg-amber-200 text-amber-900 rounded px-1">%XX</span></p>
              <DiffDisplay segments={segments} />
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

export default function UrlEncoderDecoder() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [sampleIndex, setSampleIndex] = useState(0);

  const encoded = input ? encodeUrl(input) : null;
  const decoded = input ? decodeUrl(input) : null;

  const handleLoadSample = () => {
    if (mode === 'encode') {
      const sample = SAMPLES[sampleIndex % SAMPLES.length]!;
      setInput(sample.value);
      setSampleIndex((i) => i + 1);
    } else {
      // Load an already-encoded sample for decode mode
      const raw = SAMPLES[sampleIndex % SAMPLES.length]!.value;
      setInput(encodeURIComponent(raw));
      setSampleIndex((i) => i + 1);
    }
  };

  const handleClear = () => setInput('');

  // Swap: take the first output and make it the new input, switching mode
  const handleSwap = () => {
    if (mode === 'encode' && encoded && !encoded.error) {
      setInput(encoded.component);
      setMode('decode');
    } else if (mode === 'decode' && decoded && !decoded.componentError) {
      setInput(decoded.component);
      setMode('encode');
    }
  };

  return (
    <ToolLayout
      title="URL Encoder / Decoder"
      description="Encode and decode URLs using encodeURIComponent and encodeURI"
    >
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-blue-800 text-sm">
            <strong>encodeURIComponent</strong> encodes all special characters including <code className="bg-blue-100 px-1 rounded">&amp; = / ? #</code> — use for individual values.{' '}
            <strong>encodeURI</strong> preserves URL structure characters — use for full URLs.
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setMode('encode')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === 'encode' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Encode
          </button>
          <button
            onClick={() => setMode('decode')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === 'decode' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Decode
          </button>
          <div className="flex-1" />
          {input && (
            <button
              onClick={handleSwap}
              className="px-3 py-2 rounded-md text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              title="Use first output as new input and switch mode"
            >
              ⇄ Swap
            </button>
          )}
          <Button label="Load Sample" onClick={handleLoadSample} variant="secondary" />
          <Button label="Clear" onClick={handleClear} variant="secondary" />
        </div>

        <TextArea
          label={mode === 'encode' ? 'Plain Text / URL to Encode' : 'Encoded String to Decode'}
          value={input}
          onChange={setInput}
          placeholder={
            mode === 'encode'
              ? 'e.g. https://example.com/search?q=hello world&type=article'
              : 'e.g. https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world'
          }
          rows={4}
        />

        {input && mode === 'encode' && encoded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <OutputCard
              label="encodeURIComponent"
              sublabel="Encodes everything except A–Z a–z 0–9 - _ . ! ~ * ' ( )"
              value={encoded.component}
              error={encoded.error}
              showDiff
            />
            <OutputCard
              label="encodeURI"
              sublabel="Preserves URL structure: ; , / ? : @ & = + $ # and more"
              value={encoded.full}
              error={encoded.error}
              showDiff
            />
          </div>
        )}

        {input && mode === 'decode' && decoded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <OutputCard
              label="decodeURIComponent"
              sublabel="Decodes all %XX sequences including & = / ?"
              value={decoded.component}
              error={decoded.componentError}
            />
            <OutputCard
              label="decodeURI"
              sublabel="Decodes most sequences but preserves reserved URL characters"
              value={decoded.full}
              error={decoded.fullError}
            />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
