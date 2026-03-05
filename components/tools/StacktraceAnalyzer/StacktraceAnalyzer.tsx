'use client';

import { useState } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import Button from '../../shared/Button';
import { generateSampleTrace, getSampleCount, getLanguageName, type Language } from '../../../utils/stacktrace';
import { analyzeStackTrace, type AnalysisResult } from '../../../utils/stacktrace-analyzer';

function StacktraceAnalyzer() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('javascript');
  const [sampleIndex, setSampleIndex] = useState(0);
  const [showFrameworkFrames, setShowFrameworkFrames] = useState(false);

  const analyze = () => {
    if (!input.trim()) {
      setError('Please paste a stack trace to analyze');
      setResult(null);
      return;
    }
    const analysis = analyzeStackTrace(input);
    if (analysis.language === 'unknown') {
      setError('Could not detect stack trace format. Supported: JavaScript, Python, Java, C#, Go, PHP, Ruby');
      setResult(null);
      return;
    }
    setResult(analysis);
    setError('');
  };

  const loadSample = () => {
    const count = getSampleCount(selectedLanguage);
    const nextIndex = (sampleIndex + 1) % count;
    const sample = generateSampleTrace(selectedLanguage, nextIndex);
    setInput(sample);
    setSampleIndex(nextIndex);
    setResult(null);
    setError('');
  };

  const clear = () => {
    setInput('');
    setResult(null);
    setError('');
    setSampleIndex(0);
  };

  const languages: Language[] = ['javascript', 'python', 'java', 'csharp', 'go', 'php', 'ruby'];

  return (
    <ToolLayout
      title="Stack Trace Analyzer"
      description="Analyze stack traces to identify root causes, explain errors, and separate application code from framework internals"
      fullWidth
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <Button label="Analyze" onClick={analyze} variant="primary" />
          <div className="flex items-center gap-2">
            <select
              value={selectedLanguage}
              onChange={(e) => {
                setSelectedLanguage(e.target.value as Language);
                setSampleIndex(0);
              }}
              className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {languages.map(lang => (
                <option key={lang} value={lang}>{getLanguageName(lang)}</option>
              ))}
            </select>
            <Button label="Load Sample" onClick={loadSample} variant="secondary" />
          </div>
          <Button label="Clear" onClick={clear} variant="secondary" />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <TextArea
              value={input}
              onChange={setInput}
              label="Paste Stack Trace"
              placeholder="Paste your stack trace here..."
              rows={24}
            />
          </div>

          <div className="space-y-4">
            {result ? (
              <>
                {/* Error Summary */}
                <div className="border border-red-200 rounded-md overflow-hidden">
                  <div className="bg-red-50 px-4 py-3 border-b border-red-200">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-red-800 text-sm">Error Summary</h3>
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                        {getLanguageName(result.language)}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <p className="font-mono text-sm">
                      <span className="text-red-700 font-bold">{result.errorType}</span>
                      {result.errorMessage && (
                        <span className="text-slate-700">: {result.errorMessage}</span>
                      )}
                    </p>
                    {result.explanation && (
                      <p className="text-slate-600 text-sm">{result.explanation.description}</p>
                    )}
                  </div>
                </div>

                {/* Root Cause */}
                {result.rootCauseFrame && (
                  <div className="border border-amber-200 rounded-md overflow-hidden">
                    <div className="bg-amber-50 px-4 py-3 border-b border-amber-200">
                      <h3 className="font-semibold text-amber-800 text-sm">Likely Root Cause</h3>
                    </div>
                    <div className="p-4">
                      <div className="font-mono text-sm space-y-1">
                        {result.rootCauseFrame.functionName && (
                          <p>
                            <span className="text-slate-500 text-xs">function </span>
                            <span className="text-green-700 font-semibold">{result.rootCauseFrame.functionName}</span>
                          </p>
                        )}
                        {result.rootCauseFrame.filePath && (
                          <p>
                            <span className="text-slate-500 text-xs">file </span>
                            <span className="text-blue-700">{result.rootCauseFrame.filePath}</span>
                            {result.rootCauseFrame.lineNumber && (
                              <span className="text-purple-700 font-semibold">:{result.rootCauseFrame.lineNumber}</span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Common Causes & Fixes */}
                {result.explanation && (
                  <div className="grid grid-cols-1 gap-4">
                    <div className="border border-slate-200 rounded-md overflow-hidden">
                      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                        <h3 className="font-semibold text-slate-800 text-sm">Common Causes</h3>
                      </div>
                      <ul className="p-4 space-y-1">
                        {result.explanation.commonCauses.map((cause, i) => (
                          <li key={i} className="text-sm text-slate-700 flex gap-2">
                            <span className="text-red-400 shrink-0">&#x2022;</span>
                            {cause}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="border border-slate-200 rounded-md overflow-hidden">
                      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                        <h3 className="font-semibold text-slate-800 text-sm">Suggested Fixes</h3>
                      </div>
                      <ul className="p-4 space-y-1">
                        {result.explanation.suggestedFixes.map((fix, i) => (
                          <li key={i} className="text-sm text-slate-700 flex gap-2">
                            <span className="text-green-500 shrink-0">&#x2022;</span>
                            {fix}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Frame Analysis */}
                <div className="border border-slate-200 rounded-md overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-800 text-sm">
                        Call Stack ({result.totalFrames} frames)
                      </h3>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-blue-700">{result.applicationFrames} app</span>
                        <span className="text-slate-400">{result.frameworkFrames} framework</span>
                        {result.frameworkFrames > 0 && (
                          <button
                            onClick={() => setShowFrameworkFrames(!showFrameworkFrames)}
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            {showFrameworkFrames ? 'Hide' : 'Show'} framework
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-2 max-h-80 overflow-y-auto">
                    {result.frames
                      .filter(f => showFrameworkFrames || f.isApplicationCode || f.isRootCause)
                      .map((frame, i) => (
                        <div
                          key={i}
                          className={`px-3 py-2 rounded text-xs font-mono ${
                            frame.isRootCause
                              ? 'bg-amber-50 border border-amber-200'
                              : frame.isApplicationCode
                              ? 'bg-blue-50'
                              : 'bg-slate-50 opacity-60'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span className={`shrink-0 mt-0.5 w-2 h-2 rounded-full ${
                              frame.isRootCause ? 'bg-amber-500' : frame.isApplicationCode ? 'bg-blue-500' : 'bg-slate-300'
                            }`} />
                            <div className="min-w-0">
                              {frame.functionName && (
                                <span className={frame.isApplicationCode ? 'text-green-700' : 'text-slate-500'}>
                                  {frame.functionName}
                                </span>
                              )}
                              {frame.filePath && (
                                <span className="text-slate-500">
                                  {frame.functionName ? ' ' : ''}
                                  <span className={frame.isApplicationCode ? 'text-blue-700' : 'text-slate-400'}>
                                    {frame.filePath}
                                  </span>
                                  {frame.lineNumber && (
                                    <span className={frame.isApplicationCode ? 'text-purple-700' : 'text-slate-400'}>
                                      :{frame.lineNumber}
                                    </span>
                                  )}
                                </span>
                              )}
                              {frame.isRootCause && (
                                <span className="ml-2 text-amber-700 font-semibold text-[10px] uppercase">root cause</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    {!showFrameworkFrames && result.frameworkFrames > 0 && (
                      <div className="px-3 py-2 text-xs text-slate-400 text-center">
                        {result.frameworkFrames} framework frame{result.frameworkFrames > 1 ? 's' : ''} hidden
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="border border-slate-300 rounded-md bg-slate-50 h-[580px] flex items-center justify-center">
                <div className="text-center text-slate-400 space-y-2">
                  <p className="text-sm">Analysis results will appear here</p>
                  <p className="text-xs">Paste a stack trace and click Analyze</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}

export default StacktraceAnalyzer;
