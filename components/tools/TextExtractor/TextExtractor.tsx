'use client';

import { useState } from 'react';
import ToolLayout from '../ToolLayout';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import {
  extractEntities,
  getAvailablePatterns,
  exportAsJson,
  exportAsCsv,
  getUniqueValues,
  getRandomSampleText,
} from '../../../utils/textExtractor';
import type { ExtractedEntity } from '../../../utils/textExtractor';

type ExportFormat = 'json' | 'csv' | 'unique';

function TextExtractor() {
  const [input, setInput] = useState('');
  const [entities, setEntities] = useState<ExtractedEntity[]>([]);
  const [summary, setSummary] = useState<Record<string, number>>({});
  const [enabledTypes, setEnabledTypes] = useState<string[]>(
    getAvailablePatterns().map((p) => p.name)
  );
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json');
  const [hasExtracted, setHasExtracted] = useState(false);

  const patterns = getAvailablePatterns();

  const handleExtract = () => {
    const result = extractEntities(input, enabledTypes);
    setEntities(result.entities);
    setSummary(result.summary);
    setHasExtracted(true);
  };

  const handleClear = () => {
    setInput('');
    setEntities([]);
    setSummary({});
    setHasExtracted(false);
  };

  const handleLoadSample = () => {
    setInput(getRandomSampleText());
    setEntities([]);
    setSummary({});
    setHasExtracted(false);
  };

  const toggleType = (type: string) => {
    setEnabledTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const selectAll = () => setEnabledTypes(patterns.map((p) => p.name));
  const selectNone = () => setEnabledTypes([]);

  const getExportContent = (): string => {
    switch (exportFormat) {
      case 'json':
        return exportAsJson(entities);
      case 'csv':
        return exportAsCsv(entities);
      case 'unique':
        return JSON.stringify(getUniqueValues(entities), null, 2);
      default:
        return '';
    }
  };

  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      Email: 'bg-blue-100 text-blue-800',
      URL: 'bg-green-100 text-green-800',
      IPv4: 'bg-purple-100 text-purple-800',
      IPv6: 'bg-purple-100 text-purple-800',
      Phone: 'bg-yellow-100 text-yellow-800',
      Date: 'bg-orange-100 text-orange-800',
      Time: 'bg-orange-100 text-orange-800',
      UUID: 'bg-indigo-100 text-indigo-800',
      'Hex Color': 'bg-pink-100 text-pink-800',
      'Credit Card': 'bg-red-100 text-red-800',
      'MAC Address': 'bg-teal-100 text-teal-800',
      'File Path': 'bg-slate-100 text-slate-800',
      Hashtag: 'bg-cyan-100 text-cyan-800',
      Mention: 'bg-sky-100 text-sky-800',
      Semver: 'bg-emerald-100 text-emerald-800',
      JWT: 'bg-amber-100 text-amber-800',
      Base64: 'bg-lime-100 text-lime-800',
    };
    return colors[type] || 'bg-slate-100 text-slate-800';
  };

  return (
    <ToolLayout
      title="Text Extractor"
      description="Extract emails, URLs, IPs, dates, and other patterns from text using regex - no AI model required"
    >
      <div className="space-y-6">
        {/* Pattern Selection */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-slate-700">
              Entity Types to Extract
            </label>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Select All
              </button>
              <span className="text-slate-300">|</span>
              <button
                onClick={selectNone}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Select None
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {patterns.map(({ name, description }) => (
              <label
                key={name}
                className="flex items-center gap-2 cursor-pointer text-sm"
                title={description}
              >
                <input
                  type="checkbox"
                  checked={enabledTypes.includes(name)}
                  onChange={() => toggleType(name)}
                  className="w-4 h-4 text-blue-500 bg-slate-100 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-slate-700">{name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-slate-700">
              Input Text
            </label>
            <Button
              label="Load Sample"
              onClick={handleLoadSample}
              variant="secondary"
            />
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your text, logs, or data here..."
            className="w-full h-48 px-3 py-2 text-sm font-mono border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            label="Extract Entities"
            onClick={handleExtract}
            variant="primary"
            disabled={!input.trim() || enabledTypes.length === 0}
          />
          <Button label="Clear" onClick={handleClear} variant="secondary" />
        </div>

        {/* Results */}
        {hasExtracted && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-slate-700 mb-3">
                Summary
              </h3>
              {Object.keys(summary).length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(summary).map(([type, count]) => (
                    <span
                      key={type}
                      className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(type)}`}
                    >
                      {type}: {count}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No entities found matching the selected patterns.
                </p>
              )}
            </div>

            {/* Entities List */}
            {entities.length > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-slate-700 mb-3">
                  Extracted Entities ({entities.length})
                </h3>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {entities.map((entity, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-sm bg-white p-2 rounded border border-slate-100"
                    >
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium shrink-0 ${getTypeColor(entity.type)}`}
                      >
                        {entity.type}
                      </span>
                      <code className="font-mono text-slate-700 break-all">
                        {entity.value}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Export */}
            {entities.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-slate-700">
                    Export Format:
                  </label>
                  <div className="flex gap-4">
                    {[
                      { value: 'json', label: 'JSON (All)' },
                      { value: 'csv', label: 'CSV' },
                      { value: 'unique', label: 'Unique Values' },
                    ].map(({ value, label }) => (
                      <label key={value} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="exportFormat"
                          value={value}
                          checked={exportFormat === value}
                          onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                          className="w-4 h-4 text-blue-500"
                        />
                        <span className="text-sm text-slate-700">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="bg-slate-900 rounded-md p-4 overflow-x-auto">
                  <pre className="text-sm text-slate-100 font-mono whitespace-pre-wrap">
                    {getExportContent()}
                  </pre>
                </div>
                <CopyButton text={getExportContent()} label="Copy Export" />
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export default TextExtractor;
