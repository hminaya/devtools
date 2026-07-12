'use client';

import { useMemo, useState } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import CodeDisplay from '../../shared/CodeDisplay';
import CopyButton from '../../shared/CopyButton';
import Button from '../../shared/Button';
import { parseToml, toToml, jsonToToml, tomlToJson, validateToml, formatToml } from '../../../utils/toml';

type Mode = 'parse' | 'format' | 'validate' | 'to-json' | 'from-json';

const MODE_LABELS: Record<Mode, string> = {
  'parse':     'Parse (TOML → JS object)',
  'format':    'Re-format TOML',
  'validate':  'Validate only',
  'to-json':   'TOML → JSON',
  'from-json': 'JSON → TOML',
};

const SAMPLE = `# Sample Cargo-style config
[package]
name = "my-app"
version = "1.0.0"

[dependencies]
serde = "1.0"
tokio = { version = "1.0", features = ["full"] }

[features]
default = []

[profile.release]
opt-level = 3
debug = false
`;

function TomlParser() {
  const [input, setInput] = useState(SAMPLE);
  const [mode, setMode] = useState<Mode>('parse');

  const result = useMemo(() => {
    if (!input.trim()) return { ok: false, error: 'Empty input', output: undefined };
    switch (mode) {
      case 'parse': {
        const r = parseToml(input);
        return r.ok ? { ok: true, output: JSON.stringify(r.output, null, 2), error: undefined } : { ...r, output: undefined };
      }
      case 'format': {
        const r = formatToml(input);
        return { ...r, output: r.ok ? (r.output as string) : undefined };
      }
      case 'validate': {
        const r = validateToml(input);
        return r.valid
          ? { ok: true, error: undefined, output: '✓ Valid TOML' }
          : { ok: false, error: r.error, output: undefined };
      }
      case 'to-json': {
        const r = tomlToJson(input, 2);
        return { ...r, output: r.ok ? (r.output as string) : undefined };
      }
      case 'from-json': {
        const r = jsonToToml(input);
        return { ...r, output: r.ok ? (r.output as string) : undefined };
      }
      default: return { ok: false, error: 'Unknown mode', output: undefined };
    }
  }, [input, mode]);

  return (
    <ToolLayout
      title="TOML Parser"
      description="Parse, validate, format, and convert TOML — supports round-trip to JSON via smol-toml"
      fullWidth
    >
      <div className="space-y-4">
        {/* Mode selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 mr-1">Mode:</span>
          {(Object.keys(MODE_LABELS) as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                mode === m
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {MODE_LABELS[m]}
            </button>
          ))}
          <div className="flex-1" />
          <Button label="Load Sample" onClick={() => setInput(SAMPLE)} variant="secondary" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TextArea
            value={input}
            onChange={setInput}
            label={mode === 'from-json' ? 'Input JSON' : 'Input TOML'}
            placeholder={mode === 'from-json' ? '{ "package": { "name": "..." } }' : '[package]\nname = "..."\n'}
            rows={20}
          />
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-slate-700">
                {mode === 'parse' ? 'Resulting JSON' :
                 mode === 'format' ? 'Reformatted TOML' :
                 mode === 'validate' ? 'Validation' :
                 mode === 'to-json' ? 'JSON output' : 'TOML output'}
              </label>
              {result.ok && result.output && result.output !== '✓ Valid TOML' && <CopyButton text={result.output} label="Copy" />}
            </div>
            {result.error ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700 text-sm">
                {result.error}
              </div>
            ) : result.ok && result.output ? (
              mode === 'parse' || mode === 'to-json' ? (
                <CodeDisplay code={result.output} language="json" />
              ) : mode === 'validate' ? (
                <div className="bg-green-50 border border-green-200 rounded-md p-4 text-green-700 text-sm">{result.output}</div>
              ) : (
                <CodeDisplay code={result.output} language="text" />
              )
            ) : (
              <div className="border border-dashed border-slate-300 rounded-md p-8 text-center text-slate-400 text-sm">
                Output will appear here
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Backed by <a className="text-blue-700 underline" href="https://www.npmjs.com/package/smol-toml" target="_blank" rel="noopener noreferrer">smol-toml</a> — a small, spec-compliant TOML 1.0 parser. Date/time values are emitted as ISO strings; nested tables become nested objects.
        </p>
      </div>
    </ToolLayout>
  );
}

export default TomlParser;