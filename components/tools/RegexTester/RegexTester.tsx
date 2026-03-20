'use client';

import { useState, useEffect } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import CodeDisplay from '../../shared/CodeDisplay';
import { getMatches, applyReplacement, highlightSegments, type RegexMatch } from '../../../utils/regexTester';

const FLAG_OPTIONS: { flag: string; name: string; description: string }[] = [
  { flag: 'g', name: 'Global', description: 'Find all matches, not just the first' },
  { flag: 'i', name: 'Case Insensitive', description: 'hello matches Hello and HELLO' },
  { flag: 'm', name: 'Multiline', description: '^ and $ match start/end of each line' },
  { flag: 's', name: 'Dot All', description: '. matches newlines too' },
];

const SAMPLES = [
  { label: 'Words', pattern: '(\\w+)\\s(\\w+)', testString: 'hello world\nfoo bar\nbaz qux' },
  { label: 'Email', pattern: '[\\w.+-]+@[\\w-]+\\.[a-z]{2,}', testString: 'Contact us at support@example.com or sales@company.org' },
  { label: 'URL', pattern: 'https?:\\/\\/[^\\s]+', testString: 'Visit https://example.com or http://foo.org/path?q=1' },
  { label: 'Date', pattern: '\\d{4}-\\d{2}-\\d{2}', testString: 'Start: 2024-01-15, End: 2024-03-20' },
  { label: 'IP Address', pattern: '\\b(\\d{1,3}\\.){3}\\d{1,3}\\b', testString: 'Server 192.168.1.1 and backup 10.0.0.2' },
];

export default function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState<Set<string>>(new Set(['g']));
  const [testString, setTestString] = useState('');
  const [replacement, setReplacement] = useState('');
  const [mode, setMode] = useState<'match' | 'replace'>('match');
  const [matches, setMatches] = useState<RegexMatch[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [replaceResult, setReplaceResult] = useState('');
  const [sampleIndex, setSampleIndex] = useState(0);

  const handleLoadSample = () => {
    const sample = SAMPLES[sampleIndex % SAMPLES.length]!;
    setPattern(sample.pattern);
    setTestString(sample.testString);
    setReplacement('');
    setSampleIndex((i) => i + 1);
  };

  const handleClear = () => {
    setPattern('');
    setTestString('');
    setReplacement('');
    setMatches([]);
    setError(null);
    setReplaceResult('');
  };

  useEffect(() => {
    if (!pattern) {
      setMatches([]);
      setError(null);
      setReplaceResult('');
      return;
    }
    try {
      const flagStr = Array.from(flags).join('');
      const found = getMatches(pattern, flagStr, testString);
      setMatches(found);
      setError(null);
      if (mode === 'replace') {
        setReplaceResult(applyReplacement(pattern, flagStr, testString, replacement));
      }
    } catch (e) {
      setMatches([]);
      setError((e as Error).message);
      setReplaceResult('');
    }
  }, [pattern, flags, testString, replacement, mode]);

  const toggleFlag = (flag: string) => {
    setFlags((prev) => {
      const next = new Set(prev);
      if (next.has(flag)) next.delete(flag);
      else next.add(flag);
      return next;
    });
  };

  const flagStr = Array.from(flags).join('');
  const segments = error ? [] : highlightSegments(testString, matches);
  const matchesText = matches.map((m, i) => `[${i + 1}] index ${m.index}: "${m.fullMatch}"`).join('\n');

  return (
    <ToolLayout
      title="Regex Tester"
      description="Test regular expressions with match highlighting, capture groups, and string replacement"
    >
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-blue-800 text-sm">
            Enter a pattern and test string to see matches highlighted inline. Switch to Replace mode to apply substitutions.
          </p>
        </div>

        {/* Pattern + Flags */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">Pattern</label>
            {pattern && (
              error
                ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">✗ Invalid</span>
                : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">✓ Valid</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 font-mono text-lg select-none">/</span>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="e.g. (\w+)\s(\w+)"
              className={`flex-1 px-3 py-2 border rounded-md shadow-sm font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                error ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
            />
            <span className="text-gray-400 font-mono text-lg select-none">/</span>
            <span className="font-mono text-sm text-blue-700 w-8">{flagStr || ' '}</span>
          </div>
          {error && (
            <p className="text-red-600 text-sm mt-1">Invalid regex: {error}</p>
          )}

          {/* Flag toggles */}
          <div className="flex flex-wrap gap-2 mt-2">
            {FLAG_OPTIONS.map(({ flag, name, description }) => (
              <button
                key={flag}
                title={description}
                onClick={() => toggleFlag(flag)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm border transition-colors ${
                  flags.has(flag)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="font-mono font-bold">{flag}</span>
                <span className={`font-sans ${flags.has(flag) ? 'text-blue-100' : 'text-gray-500'}`}>{name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mode toggle + actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            label="Match"
            onClick={() => setMode('match')}
            variant={mode === 'match' ? 'primary' : 'secondary'}
          />
          <Button
            label="Replace"
            onClick={() => setMode('replace')}
            variant={mode === 'replace' ? 'primary' : 'secondary'}
          />
          <div className="flex-1" />
          <Button label="Load Sample" onClick={handleLoadSample} variant="secondary" />
          <Button label="Clear" onClick={handleClear} variant="secondary" />
        </div>

        {/* Test string */}
        <TextArea
          label="Test String"
          value={testString}
          onChange={setTestString}
          placeholder="Enter text to test against the pattern..."
          rows={5}
        />

        {/* Highlighted preview */}
        {testString && !error && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Highlighted Matches
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {matches.length} match{matches.length !== 1 ? 'es' : ''}
                </span>
              </label>
            </div>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md font-mono text-sm whitespace-pre-wrap break-all leading-relaxed">
              {segments.map((seg, i) =>
                seg.isMatch ? (
                  <mark key={i} className="bg-yellow-200 text-yellow-900 rounded px-0.5">
                    {seg.text}
                  </mark>
                ) : (
                  <span key={i}>{seg.text}</span>
                )
              )}
            </div>
          </div>
        )}

        {/* Replace mode */}
        {mode === 'replace' && (
          <div className="space-y-3">
            <TextArea
              label="Replacement"
              value={replacement}
              onChange={setReplacement}
              placeholder="e.g. $2 $1 or use $1, $2 for capture groups"
              rows={2}
            />
            {testString && !error && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Result</label>
                  <CopyButton text={replaceResult} label="Copy Result" />
                </div>
                <CodeDisplay code={replaceResult} language="text" />
              </div>
            )}
          </div>
        )}

        {/* Match list */}
        {matches.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700">Match Details</h3>
              <CopyButton text={matchesText} label="Copy Matches" />
            </div>
            <div className="space-y-2">
              {matches.map((match, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-md p-3">
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      #{i + 1}
                    </span>
                    <span className="text-xs text-gray-500">index: {match.index}</span>
                    <span className="font-mono text-sm text-gray-900 bg-yellow-50 px-1 rounded">
                      &quot;{match.fullMatch}&quot;
                    </span>
                  </div>
                  {match.groups.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {match.groups.map((g, gi) => {
                        const namedKey = match.namedGroups
                          ? Object.entries(match.namedGroups).find(([, v]) => v === g)?.[0]
                          : undefined;
                        return (
                          <div key={gi} className="text-xs text-gray-600 font-mono">
                            <span className="text-gray-400">
                              {namedKey ? `${namedKey} ($${gi + 1})` : `$${gi + 1}`}:{' '}
                            </span>
                            {g === undefined ? (
                              <span className="text-gray-400 italic">undefined</span>
                            ) : (
                              <span className="text-gray-800">&quot;{g}&quot;</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No matches state */}
        {pattern && testString && !error && matches.length === 0 && (
          <div className="text-center py-6 text-gray-500 text-sm">
            No matches found.
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
