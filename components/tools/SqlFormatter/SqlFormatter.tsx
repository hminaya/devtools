'use client';

import { useState } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import CodeDisplay from '../../shared/CodeDisplay';
import {
  formatSql,
  minifySql,
  DIALECT_LABELS,
  SAMPLE_QUERIES,
  type SqlDialect,
  type SqlFormatOptions,
} from '../../../utils/sqlFormatter';

const DIALECTS = Object.keys(DIALECT_LABELS) as SqlDialect[];

export default function SqlFormatter() {
  const [input, setInput] = useState('');
  const [dialect, setDialect] = useState<SqlDialect>('sql');
  const [tabWidth, setTabWidth] = useState<2 | 4>(2);
  const [keywordCase, setKeywordCase] = useState<SqlFormatOptions['keywordCase']>('upper');
  const [linesBetweenQueries, setLinesBetweenQueries] = useState<1 | 2>(1);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [sampleIndex, setSampleIndex] = useState(0);
  const [isMinified, setIsMinified] = useState(false);

  const options: SqlFormatOptions = { dialect, tabWidth, keywordCase, linesBetweenQueries };

  const handleFormat = () => {
    if (!input.trim()) return;
    setIsMinified(false);
    const result = formatSql(input, options);
    if (typeof result === 'string') {
      setOutput(result);
      setError('');
    } else {
      setOutput('');
      setError(result.error);
    }
  };

  const handleMinify = () => {
    if (!input.trim()) return;
    setOutput(minifySql(input));
    setError('');
    setIsMinified(true);
  };

  const handleLoadSample = () => {
    const sample = SAMPLE_QUERIES[sampleIndex % SAMPLE_QUERIES.length]!;
    setInput(sample.sql);
    setOutput('');
    setError('');
    setSampleIndex((i) => i + 1);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
    setIsMinified(false);
  };

  return (
    <ToolLayout
      title="SQL Formatter"
      description="Format and prettify SQL queries with support for MySQL, PostgreSQL, SQLite, and more"
      fullWidth
    >
      <div className="space-y-4">
        {/* Toolbar row 1: dialect */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500">Dialect:</span>
          <select
            value={dialect}
            onChange={(e) => setDialect(e.target.value as SqlDialect)}
            className="px-3 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {DIALECTS.map((d) => (
              <option key={d} value={d}>{DIALECT_LABELS[d]}</option>
            ))}
          </select>
        </div>

        {/* Toolbar row 2: options + actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-500 mr-1">Indent:</span>
            {([2, 4] as const).map((n) => (
              <button key={n} onClick={() => setTabWidth(n)}
                className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                  tabWidth === n ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-500 mr-1">Keywords:</span>
            {(['upper', 'lower', 'preserve'] as const).map((k) => (
              <button key={k} onClick={() => setKeywordCase(k)}
                className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                  keywordCase === k ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {k === 'upper' ? 'UPPER' : k === 'lower' ? 'lower' : 'Preserve'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-500 mr-1">Lines between queries:</span>
            {([1, 2] as const).map((n) => (
              <button key={n} onClick={() => setLinesBetweenQueries(n)}
                className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                  linesBetweenQueries === n ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <div className="flex-1" />
          <Button label="Format" onClick={handleFormat} variant="primary" />
          <Button label="Minify" onClick={handleMinify} variant="secondary" />
          <Button label="Load Sample" onClick={handleLoadSample} variant="secondary" />
          <Button label="Clear" onClick={handleClear} variant="secondary" />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Two-column editor */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <TextArea
              label="SQL Input"
              value={input}
              onChange={setInput}
              placeholder="Paste your SQL query here..."
              rows={20}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                {isMinified ? 'Minified Output' : 'Formatted Output'}
              </label>
              {output && <CopyButton text={output} label="Copy" />}
            </div>

            {output ? (
              <CodeDisplay code={output} language="sql" />
            ) : (
              <div className="border border-dashed border-slate-300 rounded-md p-8 text-center text-slate-400 text-sm">
                Click "Format" or "Minify" to see output
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
