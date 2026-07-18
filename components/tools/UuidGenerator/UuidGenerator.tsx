'use client';

import { useState } from 'react';
import ToolLayout from '../ToolLayout';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import {
  generateUUIDBatch,
  UUID_DESCRIPTIONS,
  UUID_NAMESPACES,
  type UUIDVersion,
} from '../../../utils/uuid';

const VERSIONS: UUIDVersion[] = ['nil', 'v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8'];

function UuidGenerator() {
  const [version, setVersion] = useState<UUIDVersion>('v4');
  const [quantity, setQuantity] = useState(1);
  const [namespace, setNamespace] = useState(UUID_NAMESPACES.dns!);
  const [name, setName] = useState('');
  const [localId, setLocalId] = useState('');
  const [localDomain, setLocalDomain] = useState('0');
  const [uuids, setUuids] = useState<string[]>([]);
  const [error, setError] = useState('');

  const handleGenerate = () => {
    setError('');
    try {
      const opts: { namespace?: string; name?: string; localId?: number; localDomain?: number } = {};
      if (version === 'v3' || version === 'v5') {
        if (!name.trim()) {
          setError('A name is required for name-based UUIDs (v3/v5).');
          return;
        }
        opts.namespace = namespace;
        opts.name = name;
      } else if (version === 'v2') {
        const id = parseInt(localId, 10);
        const dom = parseInt(localDomain, 10);
        if (Number.isFinite(id)) opts.localId = id;
        if (Number.isFinite(dom)) opts.localDomain = dom;
      }
      const generated = generateUUIDBatch(version, quantity, opts);
      // `nil` always returns the same value; if asked for >1, expand to that many rows
      // for UX consistency, since the user expected `quantity` rows.
      const out = version === 'nil' && quantity > 1
        ? Array.from({ length: quantity }, () => generated[0]!)
        : generated;
      setUuids(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate UUIDs');
      setUuids([]);
    }
  };

  const description = UUID_DESCRIPTIONS[version]!;
  const requiresName = version === 'v3' || version === 'v5';
  const requiresDomain = version === 'v2';

  return (
    <ToolLayout
      title="UUID Generator"
      description="Generate UUIDs across all RFC 9562 versions — nil, v1 through v8"
    >
      <div className="space-y-6">
        {/* Version selector */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            UUID Version
          </label>
          <div className="flex flex-wrap gap-2">
            {VERSIONS.map((v) => (
              <button
                key={v}
                aria-pressed={version === v}
                onClick={() => { setVersion(v); setUuids([]); setError(''); }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium border uppercase transition-colors ${
                  version === v
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-3 leading-relaxed max-w-3xl">{description}</p>
        </div>

        {/* Version-specific options */}
        {requiresName && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Namespace</label>
              <select
                value={namespace}
                aria-label="Namespace"
                onChange={(e) => setNamespace(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              >
                {Object.entries(UUID_NAMESPACES).map(([label, value]) => (
                  <option key={label} value={value!}>{label} — {value}</option>
                ))}
              </select>
              <p className="text-xs text-slate-400 mt-1">
                RFC 9562 standard namespaces: dns, url, oid, x500.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
              <input
                type="text"
                value={name}
                aria-label="Name"
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. example.com or my-idempotency-key"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-400 mt-1">
                Same namespace + name always produces the same UUID.
              </p>
            </div>
          </div>
        )}

        {requiresDomain && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Local Identifier</label>
              <input
                type="number"
                value={localId}
                aria-label="Local identifier"
                onChange={(e) => setLocalId(e.target.value)}
                placeholder="e.g. 1000 (POSIX UID/GID)"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Local Domain</label>
              <select
                value={localDomain}
                aria-label="Local domain"
                onChange={(e) => setLocalDomain(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="0">0 — Person (UID)</option>
                <option value="1">1 — Group (GID)</option>
                <option value="2">2 — Organization</option>
              </select>
            </div>
          </div>
        )}

        {/* Quantity + Generate */}
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Number of UUIDs
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={quantity}
              aria-label="Number of UUIDs"
              onChange={(e) => setQuantity(Math.max(1, Math.min(50, Number(e.target.value))))}
              className="w-32 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={version === 'nil'}
            />
            <p className="text-xs text-slate-400 mt-1">
              {version === 'nil' ? 'nil UUID is constant — only one is generated' : 'Generate between 1 and 50 UUIDs'}
            </p>
          </div>
          <Button label="Generate UUIDs" onClick={handleGenerate} variant="primary" />
        </div>

        {error && (
          <div role="alert" className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {uuids.length > 0 && (
          <div className="space-y-3">
            <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
              <p className="text-sm font-medium text-slate-700 mb-3">
                Generated UUIDs ({uuids.length}):
              </p>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {uuids.map((uuid, index) => (
                  <div key={index} className="flex items-center gap-2 group">
                    <span className="font-mono text-sm text-slate-900 flex-1 break-all">{uuid}</span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <CopyButton text={uuid} label={`Copy UUID ${uuid}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <CopyButton text={uuids.join('\n')} label="Copy All UUIDs" />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export default UuidGenerator;