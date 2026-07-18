'use client';

import { useMemo, useState } from 'react';
import ToolLayout from '../ToolLayout';
import CopyButton from '../../shared/CopyButton';
import { PORT_CATEGORIES, PORT_ENTRIES, type PortEntry } from '../../../utils/ports';

const CATEGORY_BADGE: Record<string, string> = {
  Web:           'bg-blue-100 text-blue-700 border-blue-200',
  Database:      'bg-emerald-100 text-emerald-700 border-emerald-200',
  Email:         'bg-amber-100 text-amber-700 border-amber-200',
  'File Transfer': 'bg-orange-100 text-orange-700 border-orange-200',
  'Remote Access': 'bg-purple-100 text-purple-700 border-purple-200',
  Messaging:     'bg-pink-100 text-pink-700 border-pink-200',
  Networking:    'bg-teal-100 text-teal-700 border-teal-200',
  DevOps:        'bg-indigo-100 text-indigo-700 border-indigo-200',
  Security:      'bg-red-100 text-red-700 border-red-200',
  Other:         'bg-slate-100 text-slate-700 border-slate-200',
};

function PortRow({ entry }: { entry: PortEntry }) {
  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50">
      <td className="px-3 py-2 whitespace-nowrap">
        <code className="font-mono text-lg font-bold text-slate-900">{entry.port}</code>
      </td>
      <td className="px-3 py-2">
        <code className="font-mono text-xs text-slate-600 uppercase">{entry.protocol}</code>
      </td>
      <td className="px-3 py-2 font-mono text-sm font-semibold text-slate-900">{entry.service}</td>
      <td className="px-3 py-2 text-xs text-slate-600 max-w-[26rem]">{entry.description ?? '—'}</td>
      <td className="px-3 py-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${CATEGORY_BADGE[entry.category] ?? ''}`}>
            {entry.category}
          </span>
          {entry.encrypted && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
              TLS
            </span>
          )}
          {entry.deprecated && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
              Deprecated
            </span>
          )}
        </div>
      </td>
    </tr>
  );
}

function PortReference() {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const results = useMemo(() => {
    if (!query.trim() && !categoryFilter) return PORT_ENTRIES;
    const q = query.toLowerCase();
    return PORT_ENTRIES.filter((e) => {
      if (categoryFilter && e.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        e.port.toString() === q ||
        e.service.toLowerCase().includes(q) ||
        e.protocol.toLowerCase().includes(q) ||
        (e.description?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [query, categoryFilter]);

  return (
    <ToolLayout
      title="Common Port Number Reference"
      description={`Searchable reference of ${PORT_ENTRIES.length} common TCP/UDP ports developers encounter — web, database, email, file transfer, remote access, messaging, networking, and DevOps`}
    >
      <div className="space-y-4">
        {/* Search */}
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by port (80), service (HTTP), or keyword..."
            className="flex-1 min-w-[16rem] px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
            aria-label="Search ports"
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
            aria-pressed={categoryFilter === null}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              categoryFilter === null
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}
          >
            All ({PORT_ENTRIES.length})
          </button>
          {PORT_CATEGORIES.map((cat) => {
            const count = PORT_ENTRIES.filter((e) => e.category === cat).length;
            if (count === 0) return null;
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat === categoryFilter ? null : cat)}
                aria-pressed={categoryFilter === cat}
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

        <p className="text-xs text-slate-500">
          Showing {results.length} of {PORT_ENTRIES.length} entries. Ports 0–1023 are well-known (require root), 1024–49151 are registered.
        </p>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left">Port</th>
                <th className="px-3 py-2 text-left">Protocol</th>
                <th className="px-3 py-2 text-left">Service</th>
                <th className="px-3 py-2 text-left">Description</th>
                <th className="px-3 py-2 text-left">Category</th>
              </tr>
            </thead>
            <tbody>
              {results.map((entry) => (
                <PortRow key={`${entry.port}-${entry.service}-${entry.protocol}`} entry={entry} />
              ))}
              {results.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400" role="status">
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

export default PortReference;