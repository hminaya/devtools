'use client';

import { useState, useEffect } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import {
  formatStackTrace,
  generateSampleTrace,
  getSampleCount,
  validateStackTrace,
  getLanguageName,
  detectLanguage,
  type Language,
  type FormatOptions,
  type HighlightedPart,
} from '../../../utils/stacktrace';

function StacktraceFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState<Language>('unknown');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('unknown');
  const [removeSensitiveData, setRemoveSensitiveData] = useState(false);
  const [highlightedParts, setHighlightedParts] = useState<HighlightedPart[]>([]);
  const [sampleIndex, setSampleIndex] = useState(0);

  useEffect(() => {
    if (input.trim()) {
      const detected = detectLanguage(input);
      setDetectedLanguage(detected);
      if (selectedLanguage === 'unknown') {
        setSelectedLanguage(detected);
      }
    }
  }, [input, selectedLanguage]);

  const formatTrace = () => {
    const validation = validateStackTrace(input);

    if (!validation.isValid) {
      setError(validation.error || 'Invalid stack trace');
      setOutput('');
      setHighlightedParts([]);
      return;
    }

    const options: FormatOptions = {
      language: selectedLanguage,
      removeSensitiveData,
      showHighlighting: true,
    };

    const result = formatStackTrace(input, options);

    if (result.success && result.output) {
      setOutput(result.output);
      setHighlightedParts(result.output.split('\n').map(line => ({ text: line, type: 'normal' as const })));
      setError('');
    } else {
      setError(result.error || 'Failed to format stack trace');
      setOutput('');
      setHighlightedParts([]);
    }
  };

  const generateSample = () => {
    const language = selectedLanguage === 'unknown' ? 'javascript' : selectedLanguage;
    const count = getSampleCount(language);
    const nextIndex = (sampleIndex + 1) % count;
    const sample = generateSampleTrace(language, nextIndex);
    setInput(sample);
    setSampleIndex(nextIndex);
    setOutput('');
    setError('');
    setHighlightedParts([]);
  };

  const clear = () => {
    setInput('');
    setOutput('');
    setError('');
    setDetectedLanguage('unknown');
    setSelectedLanguage('unknown');
    setRemoveSensitiveData(false);
    setHighlightedParts([]);
    setSampleIndex(0);
  };

  return (
    <ToolLayout
      title="Stacktrace Formatter"
      description="Format and beautify stack traces from multiple programming languages"
      fullWidth
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <Button label="Format" onClick={formatTrace} variant="primary" />
          <Button label="Next Example" onClick={generateSample} variant="secondary" />
          <Button label="Clear" onClick={clear} variant="secondary" />
          {output && <CopyButton text={output} label="Copy Output" />}

          <div className="flex items-center gap-2 ml-auto">
            <label className="text-sm font-medium text-slate-700">Remove Sensitive Data:</label>
            <input
              type="checkbox"
              checked={removeSensitiveData}
              onChange={(e) => setRemoveSensitiveData(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
        </div>

        {detectedLanguage !== 'unknown' && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-blue-700 text-sm font-medium">
              Detected Language: {getLanguageName(detectedLanguage)}
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700 font-medium">Error:</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <TextArea
              value={input}
              onChange={setInput}
              label="Input Stack Trace"
              placeholder="Paste your stack trace here..."
              rows={30}
            />
          </div>

          <div className="space-y-2">
            {output ? (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">Formatted Output</label>
                <div className="border border-slate-300 rounded-md bg-white overflow-hidden">
                  <pre className="p-4 text-sm font-mono whitespace-pre-wrap break-words" style={{ maxHeight: '720px', overflowY: 'auto' }}>
                    {output.split('\n').map((line, index) => {
                      const trimmed = line.trim();
                      const isIndented = line.startsWith('  ');

                      if (/(Error|TypeError|ReferenceError|SyntaxError|RangeError|URIError|EvalError|AggregateError|Exception|Traceback|panic|Fatal|PHP (?:Fatal error|Warning|Notice)|Uncaught Error):/i.test(trimmed)) {
                        return <div key={index} className="text-red-600 font-semibold">{line}</div>;
                      }

                      if (trimmed.startsWith('at ')) {
                        const match = trimmed.match(/^at\s+(.+?)\s+\((.+?):(\d+):\d+\)$/);
                        if (match && match[1] && match[2] && match[3]) {
                          return (
                            <div key={index} className="pl-4">
                              <span className="text-slate-600">at </span>
                              <span className="text-green-700">{match[1]}</span>
                              <span className="text-slate-600"> (</span>
                              <span className="text-blue-700">{match[2]}</span>
                              <span className="text-slate-600">:</span>
                              <span className="text-purple-700 font-semibold">{match[3]}</span>
                              <span className="text-slate-600">)</span>
                            </div>
                          );
                        }
                      }

                      if (/File ".+?", line \d+, in /.test(trimmed)) {
                        const match = trimmed.match(/File "(.+?)", line (\d+), in (.+)/);
                        if (match && match[1] && match[2] && match[3]) {
                          return (
                            <div key={index} className="pl-4">
                              <span className="text-slate-600">File </span>
                              <span className="text-blue-700">"{match[1]}"</span>
                              <span className="text-slate-600">, line </span>
                              <span className="text-purple-700 font-semibold">{match[2]}</span>
                              <span className="text-slate-600">, in </span>
                              <span className="text-green-700">{match[3]}</span>
                            </div>
                          );
                        }
                      }

                      if (/at\s+\S+\(.+?:\d+\)/.test(trimmed)) {
                        const match = trimmed.match(/at\s+(\S+)\s+\((.+?):(\d+)\)$/);
                        if (match && match[1] && match[2] && match[3]) {
                          return (
                            <div key={index} className="pl-4">
                              <span className="text-slate-600">at </span>
                              <span className="text-green-700">{match[1]}</span>
                              <span className="text-slate-600">(</span>
                              <span className="text-blue-700">{match[2]}</span>
                              <span className="text-slate-600">:</span>
                              <span className="text-purple-700 font-semibold">{match[3]}</span>
                              <span className="text-slate-600">)</span>
                            </div>
                          );
                        }
                      }

                      if (/goroutine \d+ \[running\]:/.test(trimmed)) {
                        return <div key={index} className="text-red-600 font-semibold">{line}</div>;
                      }

                      if (/from \S+:\d+:in `/.test(trimmed)) {
                        const match = trimmed.match(/from (.+?):(\d+):in `(.+?)'$/);
                        if (match && match[1] && match[2] && match[3]) {
                          return (
                            <div key={index} className="pl-4">
                              <span className="text-slate-600">from </span>
                              <span className="text-blue-700">{match[1]}</span>
                              <span className="text-slate-600">:</span>
                              <span className="text-purple-700 font-semibold">{match[2]}</span>
                              <span className="text-slate-600">:in '</span>
                              <span className="text-green-700">{match[3]}</span>
                              <span className="text-slate-600">'</span>
                            </div>
                          );
                        }
                      }

                      if (/#\d+\s+.+\(\d+:/.test(trimmed)) {
                        const match = trimmed.match(/#\d+\s+(.+)\((\d+):(.+)\)/);
                        if (match && match[1] && match[2] && match[3]) {
                          return (
                            <div key={index} className="pl-4">
                              <span className="text-slate-600">#</span>
                              <span className="text-slate-600">{trimmed.split(/\s+/)[0]?.substring(1)}</span>
                              <span className="text-slate-600"> </span>
                              <span className="text-green-700">{match[1]}</span>
                              <span className="text-slate-600">(</span>
                              <span className="text-purple-700 font-semibold">{match[2]}</span>
                              <span className="text-slate-600">:</span>
                              <span className="text-slate-600">{match[3]}</span>
                              <span className="text-slate-600">)</span>
                            </div>
                          );
                        }
                      }

                      return <div key={index} className={isIndented ? 'pl-4' : ''}>{line}</div>;
                    })}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">Formatted Output</label>
                <div className="border border-slate-300 rounded-md bg-slate-50 h-[720px] flex items-center justify-center">
                  <p className="text-slate-400 text-sm">Formatted stack trace will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}

export default StacktraceFormatter;
