'use client';

import { useMemo, useState } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import Button from '../../shared/Button';
import {
  buildTable,
  filterRows,
  sortRows,
  SAMPLE_CSV,
  type DelimiterChoice,
  type SortState,
} from '../../../utils/csvViewer';

const DELIMITER_OPTIONS: { value: DelimiterChoice; label: string }[] = [
  { value: 'auto', label: 'Auto' },
  { value: ',', label: 'Comma' },
  { value: ';', label: 'Semicolon' },
  { value: '\t', label: 'Tab' },
  { value: '|', label: 'Pipe' },
];

// Cap rendered rows so huge files don't lock up the DOM.
const MAX_RENDER_ROWS = 500;

export default function CsvViewer() {
  const [input, setInput] = useState('');
  const [delimiter, setDelimiter] = useState<DelimiterChoice>('auto');
  const [hasHeader, setHasHeader] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortState | null>(null);

  const table = useMemo(
    () => buildTable(input, delimiter, hasHeader),
    [input, delimiter, hasHeader]
  );

  const processed = useMemo(() => {
    const filtered = filterRows(table.rows, search);
    return sort ? sortRows(filtered, sort) : filtered;
  }, [table.rows, search, sort]);

  const visible = processed.slice(0, MAX_RENDER_ROWS);
  const hasData = table.headers.length > 0;

  const handleSort = (col: number) => {
    setSort((prev) => {
      if (!prev || prev.col !== col) return { col, dir: 'asc' };
      if (prev.dir === 'asc') return { col, dir: 'desc' };
      return null; // third click clears sorting
    });
  };

  const handleLoadSample = () => {
    setInput(SAMPLE_CSV);
    setDelimiter('auto');
    setHasHeader(true);
    setSearch('');
    setSort(null);
  };

  const handleClear = () => {
    setInput('');
    setSearch('');
    setSort(null);
  };

  return (
    <ToolLayout
      title="CSV Viewer / Table Explorer"
      description="Paste CSV and explore it as a sortable, searchable table — no spreadsheet required"
      fullWidth
    >
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
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

          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={hasHeader}
              onChange={(e) => setHasHeader(e.target.checked)}
              className="rounded border-slate-300"
            />
            First row is header
          </label>

          <div className="flex-1" />
          <Button label="Load Sample" onClick={handleLoadSample} variant="secondary" />
          <Button label="Clear" onClick={handleClear} variant="secondary" />
        </div>

        {/* Input */}
        <TextArea
          label="Input"
          value={input}
          onChange={setInput}
          placeholder="Paste CSV here..."
          rows={8}
        />

        {/* Search + counts */}
        {hasData && (
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="csv-viewer-filter" className="sr-only">Filter rows</label>
            <input
              id="csv-viewer-filter"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter rows..."
              className="flex-1 min-w-[200px] px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span aria-live="polite" className="text-sm text-slate-500">
              {processed.length}
              {processed.length !== table.rows.length && ` of ${table.rows.length}`}{' '}
              {processed.length === 1 ? 'row' : 'rows'} · {table.headers.length}{' '}
              {table.headers.length === 1 ? 'column' : 'columns'}
            </span>
          </div>
        )}

        {/* Table */}
        {hasData ? (
          <div className="border border-slate-300 rounded-md overflow-auto max-h-[600px]">
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0 z-10">
                <tr>
                  {table.headers.map((header, col) => {
                    const isSorted = sort?.col === col;
                    const ariaSort = isSorted ? (sort!.dir === 'asc' ? 'ascending' : 'descending') : 'none';
                    const onHeaderKeyDown = (e: React.KeyboardEvent) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSort(col);
                      }
                    };
                    return (
                      <th
                        key={col}
                        role="button"
                        tabIndex={0}
                        aria-sort={ariaSort}
                        onKeyDown={onHeaderKeyDown}
                        onClick={() => handleSort(col)}
                        className="bg-slate-100 border-b border-slate-300 px-3 py-2 text-left font-semibold text-slate-700 whitespace-nowrap cursor-pointer select-none hover:bg-slate-200 transition-colors"
                      >
                        <span className="inline-flex items-center gap-1">
                          {header}
                          <span className="text-slate-400 text-xs">
                            {isSorted ? (sort!.dir === 'asc' ? '▲' : '▼') : '↕'}
                          </span>
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 ? (
                  <tr>
                    <td
                      colSpan={table.headers.length}
                      className="px-3 py-8 text-center text-slate-400"
                    >
                      No rows match your filter
                    </td>
                  </tr>
                ) : (
                  visible.map((row, r) => (
                    <tr key={r} className="even:bg-slate-50 hover:bg-blue-50/50">
                      {row.map((cell, c) => (
                        <td
                          key={c}
                          className="border-b border-slate-200 px-3 py-1.5 text-slate-700 whitespace-nowrap font-mono text-xs"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border border-dashed border-slate-300 rounded-md p-8 text-center text-slate-400 text-sm">
            Paste CSV above to explore it as a table
          </div>
        )}

        {processed.length > MAX_RENDER_ROWS && (
          <p className="text-xs text-slate-400">
            Showing the first {MAX_RENDER_ROWS.toLocaleString()} of{' '}
            {processed.length.toLocaleString()} rows. Use the filter to narrow results.
          </p>
        )}
      </div>
    </ToolLayout>
  );
}
