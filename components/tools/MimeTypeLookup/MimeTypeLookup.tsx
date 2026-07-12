'use client';

import { useMemo, useState } from 'react';
import ToolLayout from '../ToolLayout';
import CopyButton from '../../shared/CopyButton';
import {
  MIME_CATEGORIES,
  MIME_ENTRIES,
  searchMimeEntries,
  type MIMEEntry,
} from '../../../utils/mimeTypes';

const CATEGORY_BADGE: Record<string, string> = {
  Application: 'bg-slate-100 text-slate-700 border-slate-200',
  Archive:     'bg-amber-100 text-amber-800 border-amber-200',
  Audio:       'bg-purple-100 text-purple-700 border-purple-200',
  Code:        'bg-blue-100 text-blue-700 border-blue-200',
  Data:        'bg-teal-100 text-teal-700 border-teal-200',
  Document:    'bg-rose-100 text-rose-700 border-rose-200',
  Font:        'bg-indigo-100 text-indigo-700 border-indigo-200',
  Image:       'bg-emerald-100 text-emerald-700 border-emerald-200',
  Text:        'bg-gray-100 text-gray-700 border-gray-200',
  Video:       'bg-red-100 text-red-700 border-red-200',
};

function Row({ entry }: { entry: MIMEEntry }) {
  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50">
      <td className="px-3 py-2 whitespace-nowrap">
        <div className="flex flex-wrap items-baseline gap-1">
          <code className="font-mono text-sm font-semibold text-slate-900">.{entry.extension}</code>
          {entry.aliases?.map((a) => (
            <code key={a} className="font-mono text-xs text-slate-500">.{a}</code>
          ))}
        </div>
      </td>
      <td className="px-3 py-2">
        <code className="font-mono text-sm text-slate-700 break-all">{entry.mimeType}</code>
      </td>
      <td className="px-3 py-2">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${CATEGORY_BADGE[entry.category] ?? ''}`}>
          {entry.category}
        </span>
      </td>
      <td className="px-3 py-2 text-xs text-slate-500 max-w-[24rem]">
        <div className="flex items-center justify-between gap-2">
          <span>{entry.description ?? '—'}</span>
          <CopyButton text={entry.mimeType} label="" />
        </div>
      </td>
    </tr>
  );
}

function MimeTypeLookup() {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const results = useMemo(() => {
    const byQuery = searchMimeEntries(query);
    if (categoryFilter) return byQuery.filter((e) => e.category === categoryFilter);
    return byQuery;
  }, [query, categoryFilter]);

  return (
    <ToolLayout
      title="MIME Type Lookup"
      description={`Search common MIME types by extension, type, or category — covers ${MIME_ENTRIES.length} types across HTML, fonts, images, video, audio, archives, documents, code, and data`}
    >
      <div className="space-y-4">
        {/* Search */}
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by extension (.png), MIME type (image/jpeg), or category..."
            className="flex-1 min-w-[16rem] px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <button
            onClick={() => { setQuery(''); setCategoryFilter(null); }}
            className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900"
          >
            Clear
          </button>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategoryFilter(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              categoryFilter === null
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}
          >
            All ({MIME_ENTRIES.length})
          </button>
          {MIME_CATEGORIES.map((cat) => {
            const count = MIME_ENTRIES.filter((e) => e.category === cat).length;
            if (count === 0) return null;
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat === categoryFilter ? null : cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  categoryFilter === cat
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Results count */}
        <p className="text-xs text-slate-500">
          Showing {results.length} of {MIME_ENTRIES.length} entries
        </p>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left">Extension</th>
                <th className="px-3 py-2 text-left">MIME Type</th>
                <th className="px-3 py-2 text-left">Category</th>
                <th className="px-3 py-2 text-left">Notes</th>
              </tr>
            </thead>
            <tbody>
              {results.map((entry) => (
                <Row key={entry.extension + entry.mimeType} entry={entry} />
              ))}
              {results.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-400">
                    No entries match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ToolLayout>
  );
}

export default MimeTypeLookup;