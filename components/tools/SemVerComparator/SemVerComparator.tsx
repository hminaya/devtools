'use client';

import { useState, useMemo } from 'react';
import ToolLayout from '../ToolLayout';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import {
  compareSemver,
  describeRelation,
  sortVersions,
  parseSemVer,
  type SemVer,
} from '../../../utils/semver';

function SemVerComparator() {
  const [a, setA] = useState('1.2.3');
  const [b, setB] = useState('1.3.0');
  const [batchInput, setBatchInput] = useState('1.0.0\n1.5.0\n2.0.0\n1.0.0-rc.1\n1.0.0-alpha');

  const aParsed = useMemo<{ ok: true; ver: SemVer } | { ok: false; error: string }>(() => {
    try { return { ok: true, ver: parseSemVer(a) }; }
    catch (e) { return { ok: false, error: e instanceof Error ? e.message : String(e) }; }
  }, [a]);
  const bParsed = useMemo<{ ok: true; ver: SemVer } | { ok: false; error: string }>(() => {
    try { return { ok: true, ver: parseSemVer(b) }; }
    catch (e) { return { ok: false, error: e instanceof Error ? e.message : String(e) }; }
  }, [b]);

  const comparison = useMemo(() => {
    if (!aParsed.ok || !bParsed.ok) return null;
    return describeRelation(a, b);
  }, [aParsed, bParsed, a, b]);

  const parsedA = aParsed.ok ? aParsed.ver : null;
  const parsedB = bParsed.ok ? bParsed.ver : null;

  const sortResult = useMemo(() => {
    const lines = batchInput.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length === 0) return { sorted: [] as string[], errors: [] };
    return sortVersions(lines);
  }, [batchInput]);

  const handleSwap = () => {
    setA(b);
    setB(a);
  };

  return (
    <ToolLayout
      title="SemVer Comparator"
      description="Compare, sort, and validate semantic version strings per SemVer 2.0.0 — with prerelease and build metadata support"
    >
      <div className="space-y-8">
        {/* Pairwise comparison */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-slate-800">Pairwise comparison</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Version A</label>
              <input
                type="text"
                value={a}
                onChange={(e) => setA(e.target.value)}
                placeholder="e.g. 1.2.3 or v2.0.0-rc.1+build.4"
                aria-label="Version A"
                className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {aParsed.ok ? (
                <p className="text-xs text-slate-500 mt-1">
                  major <b>{parsedA!.major}</b> · minor <b>{parsedA!.minor}</b> · patch <b>{parsedA!.patch}</b>
                  {parsedA!.prerelease.length > 0 && <> · prerelease <b>{parsedA!.prerelease.join('.')}</b></>}
                  {parsedA!.build.length > 0 && <> · build <b>{parsedA!.build.join('.')}</b></>}
                </p>
              ) : (
                <p role="alert" className="text-xs text-red-600 mt-1">{aParsed.error}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Version B</label>
              <input
                type="text"
                value={b}
                onChange={(e) => setB(e.target.value)}
                placeholder="e.g. 2.0.0"
                aria-label="Version B"
                className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {bParsed.ok ? (
                <p className="text-xs text-slate-500 mt-1">
                  major <b>{parsedB!.major}</b> · minor <b>{parsedB!.minor}</b> · patch <b>{parsedB!.patch}</b>
                  {parsedB!.prerelease.length > 0 && <> · prerelease <b>{parsedB!.prerelease.join('.')}</b></>}
                  {parsedB!.build.length > 0 && <> · build <b>{parsedB!.build.join('.')}</b></>}
                </p>
              ) : (
                <p role="alert" className="text-xs text-red-600 mt-1">{bParsed.error}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button label="Swap A ↔ B" onClick={handleSwap} variant="secondary" />
          </div>

          {comparison && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="flex items-baseline gap-4">
                <code className="font-mono text-lg text-slate-900">{a}</code>
                <span className="text-2xl font-bold text-blue-600">{comparison.symbol}</span>
                <code className="font-mono text-lg text-slate-900">{b}</code>
              </div>
              <p className="text-sm text-slate-600 mt-1">
                <b>{a}</b> {comparison.label} <b>{b}</b>.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Build metadata (the <code>+...</code> suffix) is ignored for precedence per SemVer 2.0.0 §10.
              </p>
            </div>
          )}
        </section>

        {/* Batch sort */}
        <section className="space-y-3 border-t border-slate-200 pt-6">
          <h2 className="text-base font-semibold text-slate-800">Sort a list of versions</h2>
          <p className="text-sm text-slate-600">
            Paste one version per line. Invalid lines are reported separately and excluded from the sorted output.
          </p>

          <textarea
            value={batchInput}
            onChange={(e) => setBatchInput(e.target.value)}
            rows={6}
            placeholder={'1.0.0\n1.5.0\n2.0.0'}
            aria-label="Versions to sort (one per line)"
            className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {sortResult.errors.length > 0 && (
            <div role="alert" className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-700 text-sm font-medium">Invalid entries:</p>
              <ul className="text-red-600 text-xs mt-1 space-y-1">
                {sortResult.errors.map((e) => (
                  <li key={e.input} className="font-mono">
                    {e.input} — <span className="text-red-500">{e.error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {sortResult.sorted.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-700">
                  Sorted (lowest → highest precedence): {sortResult.sorted.length} versions
                </p>
                <CopyButton text={sortResult.sorted.join('\n')} label="Copy sorted" />
              </div>
              <ol className="space-y-1">
                {sortResult.sorted.map((v, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <span className="text-slate-400 font-mono w-8 text-right">{i + 1}.</span>
                    <code className="font-mono text-slate-900">{v}</code>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </section>
      </div>
    </ToolLayout>
  );
}

export default SemVerComparator;