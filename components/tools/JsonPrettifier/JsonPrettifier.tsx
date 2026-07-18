'use client';

import { useState } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import CodeDisplay from '../../shared/CodeDisplay';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import { parseAndFormatJson, minifyJson } from '../../../utils/json';

function JsonPrettifier() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [autoFixed, setAutoFixed] = useState(false);
  const [mobilePane, setMobilePane] = useState<'input' | 'output'>('input');

  const generateRandomJson = () => {
    const randomData = {
      id: Math.floor(Math.random() * 10000),
      name: 'Sample User',
      email: 'user@example.com',
      isActive: Math.random() > 0.5,
      age: Math.floor(Math.random() * 50) + 20,
      address: {
        street: '123 Main St',
        city: 'New York',
        zipCode: '10001',
        coordinates: {
          lat: (Math.random() * 180 - 90).toFixed(6),
          lng: (Math.random() * 360 - 180).toFixed(6),
        },
      },
      tags: ['developer', 'javascript', 'react'],
      createdAt: new Date().toISOString(),
      metadata: {
        lastLogin: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        loginCount: Math.floor(Math.random() * 100),
      },
    };
    const minified = JSON.stringify(randomData);
    setInput(minified);
    setOutput('');
    setError('');
    setSuggestion('');
    setAutoFixed(false);
    setMobilePane('input');
  };

  const prettify = () => {
    const result = parseAndFormatJson(input, 2, true);

    if (result.success && result.output) {
      setOutput(result.output);
      setError('');
      setSuggestion(result.suggestion || '');
      setAutoFixed(result.autoFixed || false);
      setMobilePane('output');
    } else {
      setError(result.error || 'Invalid JSON');
      setSuggestion(result.suggestion || '');
      setOutput('');
      setAutoFixed(false);
    }
  };

  const minify = () => {
    const result = minifyJson(input);

    if (result.success && result.output) {
      setOutput(result.output);
      setError('');
      setSuggestion('');
      setAutoFixed(false);
      setMobilePane('output');
    } else {
      setError(result.error || 'Invalid JSON');
      setSuggestion(result.suggestion || '');
      setOutput('');
      setAutoFixed(false);
    }
  };

  const clear = () => {
    setInput('');
    setOutput('');
    setError('');
    setSuggestion('');
    setAutoFixed(false);
    setMobilePane('input');
  };

  return (
    <ToolLayout
      title="JSON Prettifier"
      description="Format, validate, and minify JSON data"
      fullWidth
    >
      <div>
        <div className="sticky top-16 z-20 -mx-4 -mt-4 mb-5 flex flex-wrap items-center justify-between gap-3 rounded-t-2xl border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:-mt-6 sm:px-6 lg:top-0">
          <div className="flex flex-wrap gap-2">
            <Button label="Prettify" onClick={prettify} variant="primary" />
            <Button label="Minify" onClick={minify} variant="secondary" />
            <Button label="Sample" onClick={generateRandomJson} variant="secondary" />
          </div>
          <button type="button" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900" onClick={clear}>
            Clear
          </button>
        </div>

        {autoFixed && suggestion && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5">
            <span className="text-emerald-600" aria-hidden="true">✓</span>
            <p className="text-sm font-medium text-emerald-800">{suggestion}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4" role="alert">
            <p className="font-bold text-red-800">Invalid JSON</p>
            <p className="mt-1 text-sm leading-6 text-red-700">{error}</p>
            {suggestion && (
              <div className="mt-3 border-t border-red-200 pt-3">
                <p className="text-sm font-semibold text-red-800">Try this</p>
                <p className="mt-1 text-sm leading-6 text-red-700">{suggestion}</p>
              </div>
            )}
          </div>
        )}

        <div className="mb-4 grid grid-cols-2 rounded-xl bg-slate-100 p-1 lg:hidden" role="tablist" aria-label="JSON workspace">
          <button
            type="button"
            role="tab"
            id="json-tab-input"
            aria-selected={mobilePane === 'input'}
            aria-controls="json-panel-input"
            tabIndex={mobilePane === 'input' ? 0 : -1}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${mobilePane === 'input' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'}`}
            onClick={() => setMobilePane('input')}
          >
            Input <span className="ml-1 text-xs font-normal text-slate-400">{input.length.toLocaleString()}</span>
          </button>
          <button
            type="button"
            role="tab"
            id="json-tab-output"
            aria-selected={mobilePane === 'output'}
            aria-controls="json-panel-output"
            tabIndex={mobilePane === 'output' ? 0 : -1}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${mobilePane === 'output' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'}`}
            onClick={() => setMobilePane('output')}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                setMobilePane(mobilePane === 'input' ? 'output' : 'input');
                window.setTimeout(() => {
                  document.getElementById(mobilePane === 'input' ? 'json-tab-output' : 'json-tab-input')?.focus();
                }, 0);
              }
            }}
          >
            Output <span className="ml-1 text-xs font-normal text-slate-400">{output.length.toLocaleString()}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className={mobilePane === 'input' ? 'block' : 'hidden lg:block'} role="tabpanel" id="json-panel-input" aria-labelledby="json-tab-input">
            <TextArea
              value={input}
              onChange={setInput}
              label="Input JSON"
              placeholder='{"example": "paste your JSON here"}'
              rows={18}
              className="min-h-80 lg:min-h-[520px]"
            />
            <p className="mt-2 text-right text-xs tabular-nums text-slate-400">{input.length.toLocaleString()} characters</p>
          </div>

          <div className={`${mobilePane === 'output' ? 'block' : 'hidden lg:block'} space-y-2`} role="tabpanel" id="json-panel-output" aria-labelledby="json-tab-output">
            {output ? (
              <>
                <CodeDisplay
                  code={output}
                  language="json"
                  label="Output"
                />
                <CopyButton text={output} label="Copy Output" />
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Output</span>
                <div className="flex h-80 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 lg:h-[520px]">
                  <div className="max-w-xs px-6 text-center">
                    <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-white font-mono text-slate-400 shadow-sm" aria-hidden="true">{'{}'}</span>
                    <p className="mt-3 text-sm font-semibold text-slate-600">Your formatted JSON appears here</p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">Paste JSON, then choose Prettify or Minify.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}

export default JsonPrettifier;
