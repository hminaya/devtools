'use client';

import { useState } from 'react';
import ToolLayout from '../ToolLayout';
import CopyButton from '../../shared/CopyButton';
import {
  HTTP_STATUS_CODES,
  CATEGORIES,
  CATEGORY_LABELS,
  filterStatusCodes,
  type CategoryFilter,
  type HttpStatusCode,
} from '../../../utils/httpStatusCodes';

const CATEGORY_COLORS: Record<string, string> = {
  '1xx': 'bg-blue-100 text-blue-700 border-blue-200',
  '2xx': 'bg-green-100 text-green-700 border-green-200',
  '3xx': 'bg-amber-100 text-amber-700 border-amber-200',
  '4xx': 'bg-orange-100 text-orange-700 border-orange-200',
  '5xx': 'bg-red-100 text-red-700 border-red-200',
};

const CATEGORY_CODE_COLORS: Record<string, string> = {
  '1xx': 'text-blue-600',
  '2xx': 'text-green-600',
  '3xx': 'text-amber-600',
  '4xx': 'text-orange-600',
  '5xx': 'text-red-600',
};

const CATEGORY_TAB_ACTIVE: Record<string, string> = {
  '1xx': 'bg-blue-600 text-white',
  '2xx': 'bg-green-600 text-white',
  '3xx': 'bg-amber-500 text-white',
  '4xx': 'bg-orange-500 text-white',
  '5xx': 'bg-red-600 text-white',
};

function StatusCard({ entry }: { entry: HttpStatusCode }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="border border-slate-200 rounded-lg bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer"
      onClick={() => setExpanded((e) => !e)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-mono text-2xl font-bold ${CATEGORY_CODE_COLORS[entry.category]}`}>
              {entry.code}
            </span>
            <div className="flex flex-wrap gap-1.5">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${CATEGORY_COLORS[entry.category]}`}>
                {entry.category} {CATEGORY_LABELS[entry.category]}
              </span>
              {entry.isDeprecated && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                  Deprecated
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <CopyButton text={entry.code.toString()} label="Copy" />
          </div>
        </div>

        <h3 className="text-sm font-semibold text-slate-900 mb-1">{entry.name}</h3>
        <p className="text-xs text-slate-600 leading-relaxed">{entry.description}</p>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-slate-200">
            <p className="text-xs text-slate-700 leading-relaxed">{entry.detail}</p>
          </div>
        )}

        <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
          <span>{expanded ? '▲ less' : '▼ more'}</span>
        </div>
      </div>
    </div>
  );
}

export default function HttpStatusCodes() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All');

  const filtered = filterStatusCodes(HTTP_STATUS_CODES, search, activeCategory);

  return (
    <ToolLayout
      title="HTTP Status Code Reference"
      description="Searchable reference of all HTTP status codes with descriptions and use cases"
      fullWidth
    >
      <div className="space-y-5">
        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by code, name, or description..."
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            const count = cat === 'All'
              ? HTTP_STATUS_CODES.length
              : HTTP_STATUS_CODES.filter((e) => e.category === cat).length;
            const activeClass = cat === 'All' ? 'bg-slate-700 text-white' : CATEGORY_TAB_ACTIVE[cat];

            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  isActive ? activeClass : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'All' ? 'All' : `${cat} ${CATEGORY_LABELS[cat]}`}
                <span className={`ml-1.5 text-xs ${isActive ? 'opacity-70' : 'text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Results count */}
        <p className="text-sm text-slate-500">
          {filtered.length} status code{filtered.length !== 1 ? 's' : ''}
          {search && ` matching "${search}"`}
        </p>

        {/* Cards */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            No status codes match your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((entry) => (
              <StatusCard key={entry.code} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
