'use client';

import { useMemo, useState } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import CodeDisplay from '../../shared/CodeDisplay';
import CopyButton from '../../shared/CopyButton';
import { queryJsonPath } from '../../../utils/jsonPath';

const SAMPLE_JSON = JSON.stringify({
  store: {
    book: [
      { category: 'ref', author: 'Nigel Rees', title: 'Sayings of the Century', price: 8.95 },
      { category: 'fic', author: 'Evelyn Waugh', title: 'Sword of Honour', price: 12.99 },
      { category: 'fic', author: 'Herman Melville', title: 'Moby Dick', price: 8.99 },
      { category: 'ref', author: 'J. R. R. Tolkien', title: 'The Lord of the Rings', isbn: '0-395-19395-8', price: 22.99 },
    ],
    bicycle: { color: 'red', price: 19.95 },
  },
}, null, 2);

const EXAMPLE_QUERIES = [
  { label: 'Author of every book', path: '$.store.book[*].author' },
  { label: 'All authors (recursive)', path: '$..author' },
  { label: 'Books under $10', path: '$.store.book[?(@.price < 10)].title' },
  { label: 'Books with ISBN', path: '$..book[?(@.isbn)].title' },
  { label: 'Bicycle color', path: '$.store.bicycle.color' },
  { label: 'First book title', path: '$.store.book[0].title' },
  { label: 'Slice [1:3] titles', path: '$.store.book[1:3].title' },
  { label: 'All prices (recursive)', path: '$.store..price' },
];

function JsonPathTester() {
  const [json, setJson] = useState(SAMPLE_JSON);
  const [path, setPath] = useState('$..author');

  const result = useMemo(() => {
    if (!json.trim()) return { error: 'JSON is empty', matches: [], paths: [] };
    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch (e) {
      return { error: 'JSON parse error: ' + (e instanceof Error ? e.message : String(e)), matches: [], paths: [] };
    }
    if (!path.trim()) return { error: 'Enter a JSONPath', matches: [], paths: [] };
    return queryJsonPath(path, parsed);
  }, [json, path]);

  return (
    <ToolLayout
      title="JSONPath Query Engine"
      description="Test JSONPath expressions against your JSON — supports dot/bracket access, wildcards, slices, recursive descent, and simple filter expressions"
      fullWidth
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TextArea
            value={json}
            onChange={setJson}
            label="JSON"
            placeholder="Paste JSON here"
            rows={20}
          />
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">JSONPath query</label>
              <input
                type="text"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="e.g. $.store.book[?(@.price < 10)].title"
                aria-label="JSONPath query"
                className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLE_QUERIES.map((ex) => (
                <button
                  key={ex.path}
                  onClick={() => setPath(ex.path)}
                  className="px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                  title={ex.path}
                >
                  {ex.label}
                </button>
              ))}
            </div>

            <div aria-live="polite" className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-baseline justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-800">Result</h3>
                {!result.error && (
                  <span className="text-xs text-slate-500">
                    {result.matches.length} match{result.matches.length === 1 ? '' : 'es'}
                  </span>
                )}
              </div>
              {result.error ? (
                <div role="alert" className="text-red-700 text-sm">{result.error}</div>
              ) : result.matches.length === 0 ? (
                <div className="text-slate-400 text-sm">No matches.</div>
              ) : (
                <ol className="space-y-2 text-sm">
                  {result.matches.map((m, i) => (
                    <li key={i} className="rounded-md border border-slate-100 bg-slate-50 p-2">
                      <div className="text-xs text-slate-500 font-mono mb-1 break-all">{result.paths[i]}</div>
                      <pre className="font-mono text-xs text-slate-900 whitespace-pre-wrap break-words max-h-40 overflow-y-auto">
                        {JSON.stringify(m, null, 2)}
                      </pre>
                    </li>
                  ))}
                </ol>
              )}
              {!result.error && result.matches.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <CopyButton text={JSON.stringify(result.matches, null, 2)} label="Copy values" />
                  <CopyButton text={result.paths.join('\n')} label="Copy paths" />
                </div>
              )}
            </div>
          </div>
        </div>

        <details className="rounded-xl border border-slate-200 bg-white p-4">
          <summary className="cursor-pointer text-sm font-semibold text-slate-800">
            Supported syntax
          </summary>
          <div className="mt-3 grid sm:grid-cols-2 gap-2 text-xs text-slate-600">
            <div><code className="font-mono">$</code> — root</div>
            <div><code className="font-mono">.name</code> — property access</div>
            <div><code className="font-mono">[&apos;name&apos;]</code> — bracketed property</div>
            <div><code className="font-mono">[0]</code> — array index</div>
            <div><code className="font-mono">[1:3]</code> — array slice</div>
            <div><code className="font-mono">[*]</code> — wildcard</div>
            <div><code className="font-mono">..name</code> — recursive descent</div>
            <div><code className="font-mono">..*</code> — every descendant</div>
            <div><code className="font-mono">[?(@.price &lt; 10)]</code> — numeric filter</div>
            <div><code className="font-mono">[?(@.published == true)]</code> — equality filter</div>
            <div><code className="font-mono">[?(@.isbn)]</code> — truthy property check</div>
          </div>
        </details>
      </div>
    </ToolLayout>
  );
}

export default JsonPathTester;