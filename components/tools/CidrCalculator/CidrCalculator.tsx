'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import ToolLayout from '../ToolLayout';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import {
  calculateCidr,
  subnetSplitFromNetwork,
  subnetSplitCount,
  formatBigInt,
  formatBigIntWithScientific,
  type CalculateCidrResult,
  type SubnetResult,
} from '../../../utils/cidr';
import { trackToolEvent } from '../../../utils/analytics';

interface InfoCard {
  label: string;
  value: string;
  hint?: string;
}

const DEFAULT_INPUT = '192.168.1.0/24';

const V4_PRESETS: Array<{ label: string; value: string }> = [
  { label: 'Class A private /8', value: '10.0.0.0/8' },
  { label: 'Class B private /12', value: '172.16.0.0/12' },
  { label: 'Class C private /24', value: '192.168.1.0/24' },
  { label: 'Loopback /8', value: '127.0.0.0/8' },
  { label: 'Link-local /16', value: '169.254.0.0/16' },
  { label: 'RFC 3021 /31', value: '10.0.0.0/31' },
  { label: 'Host route /32', value: '8.8.8.8/32' },
];

const V6_PRESETS: Array<{ label: string; value: string }> = [
  { label: 'Documentation /32', value: '2001:db8::/32' },
  { label: 'ULA /48', value: 'fd00:dead:beef::/48' },
  { label: 'Link-local /10', value: 'fe80::/10' },
  { label: 'ULA range /7', value: 'fc00::/7' },
  { label: 'IPv4-mapped /96', value: '::ffff:0:0/96' },
  { label: 'Typical subnet /64', value: '2001:db8:1:2::/64' },
];

function CidrCalculator() {
  const [input, setInput] = useState(DEFAULT_INPUT);
  const [result, setResult] = useState<CalculateCidrResult | null>(null);
  const [splitTarget, setSplitTarget] = useState<number | null>(null);
  const lastTrackedInput = useRef('');

  useEffect(() => {
    const computed = calculateCidr(input);
    setResult(computed);
    if (computed.valid && lastTrackedInput.current !== input) {
      trackToolEvent('tool_success', {
        tool_id: 'cidr-calculator',
        action: 'Calculate CIDR',
        method: computed.version,
      });
      lastTrackedInput.current = input;
    }
  }, [input]);

  useEffect(() => {
    if (!result || !result.valid) {
      setSplitTarget(null);
      return;
    }
    // Default split target = current prefix + 2 (cuts into quarters)
    const proposed = result.prefix + 2;
    const capped = Math.min(proposed, result.prefixMax);
    setSplitTarget(capped <= result.prefix ? null : capped);
  }, [result?.prefix, result?.prefixMax, result?.valid]);

  const splitResults: SubnetResult[] = useMemo(() => {
    if (!result || !result.valid || splitTarget === null) return [];
    if (splitTarget <= result.prefix) return [];
    return subnetSplitFromNetwork(
      result.networkInt,
      result.prefix,
      splitTarget,
      result.version,
      256,
    );
  }, [result, splitTarget]);

  const splitTotal = useMemo(() => {
    if (!result || !result.valid || splitTarget === null) return 0;
    return subnetSplitCount(result.prefix, splitTarget);
  }, [result, splitTarget]);

  const isV6 = result?.version === 'ipv6';

  const cards: InfoCard[] = useMemo(() => {
    if (!result || !result.valid) return [];
    const c: InfoCard[] = [
      { label: 'Network Address', value: result.network, hint: `${result.prefixLength}-bit network` },
      { label: 'IP Address', value: result.ip, hint: 'Address as entered' },
    ];
    if (result.broadcast) {
      c.push({ label: 'Broadcast Address', value: result.broadcast, hint: 'IPv4 only' });
    }
    if (result.netmask) {
      c.push({ label: 'Subnet Mask', value: result.netmask, hint: 'Dotted decimal' });
    }
    if (result.wildcard) {
      c.push({ label: 'Wildcard Mask', value: result.wildcard, hint: 'Inverse of mask' });
    }
    c.push({
      label: 'Prefix Length',
      value: `/${result.prefixLength}`,
      hint: `Allowed range: /${result.prefixMin} – /${result.prefixMax}`,
    });
    c.push({
      label: 'Total Addresses',
      value: formatBigIntWithScientific(result.totalAddresses, result.version),
    });
    c.push({
      label: 'Usable Hosts',
      value: formatBigIntWithScientific(result.usableHosts, result.version),
      hint: isV6 ? 'IPv6 has no broadcast' : 'Total − 2 (RFC 3021 handles /31, /32)',
    });
    if (result.hostRange) {
      c.push({ label: 'Host Range', value: result.hostRange, hint: 'First – last usable host' });
    }
    if (result.classLabel) {
      c.push({ label: 'Class', value: result.classLabel, hint: 'IPv4 historical class' });
    }
    if (result.reverseDns) {
      c.push({ label: 'Reverse DNS (PTR)', value: result.reverseDns });
    }
    if (result.ipAsInteger) {
      c.push({ label: 'IP as Integer', value: result.ipAsInteger, hint: 'Decimal' });
    }
    return c;
  }, [result, isV6]);

  const handleClear = () => {
    setInput('');
    setSplitTarget(null);
  };

  const handlePreset = (value: string) => {
    setInput(value);
  };

  return (
    <ToolLayout
      title="CIDR / Subnet Calculator"
      description="IPv4 and IPv6 CIDR calculator — network, broadcast, subnet mask, host range, RFC 1918 / ULA detection, and subnet splitting"
      fullWidth
    >
      <div className="space-y-6">
        {/* Input */}
        <div className="space-y-3">
          <label htmlFor="cidr-input" className="block text-xs font-bold uppercase tracking-[0.1em] text-slate-500">
            CIDR or IP / Prefix
          </label>
          <input
            id="cidr-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="192.168.1.0/24  or  2001:db8::/32"
            spellCheck={false}
            autoComplete="off"
            className="w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 font-mono text-lg text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
          {result && !result.valid && result.error && (
            <p className="text-sm text-red-600" role="alert">{result.error}</p>
          )}
        </div>

        {/* Presets */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Presets:</span>
          {V4_PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => handlePreset(p.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"
              title={p.value}
            >
              {p.label}
            </button>
          ))}
          {V6_PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => handlePreset(p.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"
              title={p.value}
            >
              {p.label}
            </button>
          ))}
          <Button label="Clear" onClick={handleClear} variant="secondary" />
        </div>

        {/* Special-range pill */}
        {result && result.valid && result.specialLabel && (
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm text-amber-800">
            <span className="font-semibold">{result.specialLabel}</span>
            {result.isPrivate && <span className="text-amber-700">· private</span>}
            {result.isLoopback && <span className="text-amber-700">· loopback</span>}
            {result.isLinkLocal && <span className="text-amber-700">· link-local</span>}
            {result.isMulticast && <span className="text-amber-700">· multicast</span>}
            {result.isDocumentation && <span className="text-amber-700">· documentation</span>}
            {result.isReserved && <span className="text-amber-700">· reserved</span>}
          </div>
        )}

        {/* Cards grid */}
        {result && result.valid && cards.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((c) => (
              <div
                key={c.label}
                className="group rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-300"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {c.label}
                  </span>
                  <div className="opacity-0 transition-opacity group-hover:opacity-100">
                    <CopyButton text={c.value} label="Copy value" />
                  </div>
                </div>
                <div className="font-mono text-sm text-slate-900 break-all">
                  {c.value}
                </div>
                {c.hint && (
                  <div className="mt-1 text-xs text-slate-500">{c.hint}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Binary view */}
        {result && result.valid && result.binaryView && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Binary View
              </span>
              <CopyButton text={result.binaryView} label="Copy binary view" />
            </div>
            <pre className="overflow-x-auto px-1 py-1 font-mono text-xs leading-5 text-slate-700">
              {result.binaryView}
            </pre>
          </div>
        )}

        {/* Subnet splitter */}
        {result && result.valid && (
          <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Subnet Splitter</h3>
                <p className="text-xs text-slate-500">
                  Split /{result.prefix} into smaller subnets. Outputs up to 256 rows.
                </p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <label htmlFor="split-target" className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">
                  Target Prefix /
                </label>
                <input
                  id="split-target"
                  type="number"
                  min={result.prefix + 1}
                  max={result.prefixMax}
                  value={splitTarget ?? ''}
                  onChange={(e) => setSplitTarget(e.target.value === '' ? null : Number(e.target.value))}
                  placeholder={`${result.prefix + 2}`}
                  className="w-20 rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {splitTarget !== null && splitTarget > result.prefix && splitTarget <= result.prefixMax && (
              <div className="text-xs text-slate-600">
                Produces <strong>{splitTotal.toLocaleString()}</strong> subnet{splitTotal === 1 ? '' : 's'} of{' '}
                <strong>/{splitTarget}</strong>{' '}
                (each with{' '}
                <strong>
                  {formatBigIntWithScientific(
                    result.version === 'ipv4'
                      ? BigInt(Math.pow(2, result.prefixMax - splitTarget) - (splitTarget >= 31 ? 0 : 2))
                      : 1n << BigInt(result.prefixMax - splitTarget),
                    result.version,
                  )}
                </strong>{' '}
                {result.version === 'ipv4' ? 'usable hosts' : 'addresses'}).
                {splitTotal > 256 && (
                  <span className="text-amber-700"> Showing first 256 below.</span>
                )}
              </div>
            )}

            {splitResults.length > 0 && (
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-3 py-2">#</th>
                      <th className="px-3 py-2">CIDR</th>
                      <th className="px-3 py-2">Network</th>
                      <th className="px-3 py-2">First Host</th>
                      <th className="px-3 py-2">Last Host</th>
                      <th className="px-3 py-2 text-right">Usable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {splitResults.map((s, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-3 py-2 text-slate-500">{i + 1}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-slate-900">{s.cidr}</span>
                            <span className="opacity-0 transition-opacity hover:opacity-100 group-hover:opacity-100">
                              <CopyButton text={s.cidr} label="Copy CIDR" />
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2 font-mono text-slate-900">{s.network}</td>
                        <td className="px-3 py-2 font-mono text-slate-700">{s.firstHost}</td>
                        <td className="px-3 py-2 font-mono text-slate-700">{s.lastHost}</td>
                        <td className="px-3 py-2 text-right font-mono text-slate-700">
                          {formatBigInt(s.usableHosts)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {splitTarget !== null && splitTarget <= result.prefix && (
              <p className="text-xs text-red-600" role="alert">
                Target prefix must be larger than the source prefix (/{result.prefix}).
              </p>
            )}
          </div>
        )}

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          <strong className="font-semibold">Notes:</strong>{' '}
          All math is 100% client-side. IPv4 uses BigInt-safe 32-bit arithmetic —
          RFC 3021 point-to-point links (/31) correctly report 2 usable hosts.
          IPv6 addresses are canonicalized per RFC 5952 (lowercase, longest-zero-run compression).
          Host counts for /64+ IPv6 prefixes display in both full decimal and scientific notation.
        </div>
      </div>
    </ToolLayout>
  );
}

export default CidrCalculator;