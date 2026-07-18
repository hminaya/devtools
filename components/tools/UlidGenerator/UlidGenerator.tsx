'use client';

import { useMemo, useState } from 'react';
import ToolLayout from '../ToolLayout';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import {
  generateULIDs,
  MonotonicULID,
  decodeULIDTimestamp,
} from '../../../utils/ulid';

function UlidGenerator() {
  const [quantity, setQuantity] = useState(5);
  const [monotonic, setMonotonic] = useState(true);
  const [ulids, setUlids] = useState<string[]>([]);

  const handleGenerate = () => {
    if (monotonic) {
      const gen = new MonotonicULID();
      setUlids(Array.from({ length: quantity }, () => gen.next()));
    } else {
      setUlids(generateULIDs(quantity));
    }
  };

  return (
    <ToolLayout
      title="ULID Generator"
      description="Generate ULIDs (Universally Unique Lexicographically Sortable Identifiers) — 26-char Crockford base32 encodings of 48-bit timestamp + 80-bit random"
    >
      <div className="space-y-6">
        <div className="grid sm:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Number of ULIDs</label>
            <input
              type="number"
              min="1"
              max="1000"
              value={quantity}
              aria-label="Number of ULIDs"
              onChange={(e) => setQuantity(Math.max(1, Math.min(1000, Number(e.target.value))))}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-slate-400 mt-1">Generate between 1 and 1000 ULIDs</p>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={monotonic}
              onChange={(e) => setMonotonic(e.target.checked)}
              className="rounded border-slate-300"
            />
            Monotonic mode (avoid same-millisecond collisions)
          </label>
        </div>

        <Button label="Generate ULIDs" onClick={handleGenerate} variant="primary" />

        {ulids.length > 0 && (
          <div className="space-y-3">
            <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-slate-700">
                  Generated ULIDs ({ulids.length}):
                </p>
                <CopyButton text={ulids.join('\n')} label="Copy All" />
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {ulids.map((ulid, idx) => (
                  <div key={idx} className="flex items-center gap-3 group">
                    <span className="text-xs text-slate-400 font-mono w-8 text-right tabular-nums">{idx + 1}</span>
                    <code className="font-mono text-sm text-slate-900 flex-1 break-all">{ulid}</code>
                    <span className="text-xs text-slate-400 hidden sm:inline">
                      {new Date(decodeULIDTimestamp(ulid)).toISOString().slice(0, 19)}Z
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <CopyButton text={ulid} label={`Copy ULID ${ulid}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="bg-slate-50 border border-slate-200 rounded-md p-4 text-sm text-slate-600 space-y-2">
          <p>
            <b>ULID</b> format: <code className="font-mono">01ARZ3NDEKTSV4RRFFQ69G5FAV</code> (26 chars).
            First 10 chars encode the Unix timestamp (ms); last 16 are random Crockford Base32.
          </p>
          <p>
            ULIDs sort lexicographically by time, making them ideal for database indexes and event logs
            where insertion order matters and UUIDs of the same major version (v4) would produce random
            sort order.
          </p>
          {monotonic && (
            <p>
              <b>Monotonic mode</b> increments the random portion by 1 when multiple ULIDs share the same
              millisecond, guaranteeing strict ascending order even within a tight burst.
            </p>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}

export default UlidGenerator;