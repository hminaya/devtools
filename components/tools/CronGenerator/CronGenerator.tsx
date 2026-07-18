'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import ToolLayout from '../ToolLayout';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import {
  parseCron,
  describeCron,
  getNextRuns,
  formatRun,
  relativeFromNow,
  CRON_TIMEZONES,
  type ParsedCron,
} from '../../../utils/cron';

type FieldMode = 'every' | 'everyN' | 'specific' | 'range';

interface FieldState {
  mode: FieldMode;
  step: number;
  values: number[];
  rangeStart: number;
  rangeEnd: number;
}

interface FieldConfig {
  key: 'minute' | 'hour' | 'dom' | 'month' | 'dow';
  label: string;
  unit: string;
  min: number;
  max: number;
  defaultStep: number;
  cols: number;
  formatLabel?: (n: number) => string;
}

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DOW_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const FIELDS: FieldConfig[] = [
  { key: 'minute', label: 'Minute',       unit: 'minute', min: 0, max: 59, defaultStep: 5, cols: 12 },
  { key: 'hour',   label: 'Hour',         unit: 'hour',   min: 0, max: 23, defaultStep: 2, cols: 12 },
  { key: 'dom',    label: 'Day of Month', unit: 'day',    min: 1, max: 31, defaultStep: 5, cols: 8 },
  {
    key: 'month', label: 'Month', unit: 'month', min: 1, max: 12, defaultStep: 1, cols: 6,
    formatLabel: (n) => MONTH_LABELS[n - 1] ?? String(n),
  },
  {
    key: 'dow', label: 'Day of Week', unit: 'day-of-week', min: 0, max: 6, defaultStep: 1, cols: 7,
    formatLabel: (n) => DOW_LABELS[n] ?? String(n),
  },
];

function defaultState(c: FieldConfig): FieldState {
  return {
    mode: 'every',
    step: c.defaultStep,
    values: [],
    rangeStart: c.min,
    rangeEnd: c.max,
  };
}

function fieldToCron(s: FieldState, c: FieldConfig): string {
  if (s.mode === 'every') return '*';
  if (s.mode === 'everyN') {
    if (s.step <= 1) return '*';
    return `*/${s.step}`;
  }
  if (s.mode === 'specific') {
    if (s.values.length === 0) return '*';
    if (s.values.length === c.max - c.min + 1) return '*';
    return [...s.values].sort((a, b) => a - b).join(',');
  }
  // range
  if (s.rangeStart === c.min && s.rangeEnd === c.max) return '*';
  return `${s.rangeStart}-${s.rangeEnd}`;
}

const MODE_LABELS: Record<FieldMode, string> = {
  every: 'Every',
  everyN: 'Every N',
  specific: 'Specific',
  range: 'Range',
};

function FieldCard({
  config,
  state,
  onChange,
}: {
  config: FieldConfig;
  state: FieldState;
  onChange: (s: FieldState) => void;
}) {
  const range: number[] = [];
  for (let i = config.min; i <= config.max; i++) range.push(i);
  const formatLabel = config.formatLabel ?? ((n: number) => String(n));

  const toggleValue = (v: number) => {
    const set = new Set(state.values);
    if (set.has(v)) set.delete(v);
    else set.add(v);
    onChange({ ...state, values: Array.from(set).sort((a, b) => a - b) });
  };

  const rangeInvalid = state.mode === 'range' && state.rangeEnd < state.rangeStart;

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
        <h3 className="text-sm font-semibold text-slate-700">
          {config.label}
          <span className="text-xs font-normal text-slate-500 ml-2">
            ({config.min}–{config.max})
          </span>
        </h3>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex gap-1 flex-wrap">
          {(Object.keys(MODE_LABELS) as FieldMode[]).map((m) => (
            <button
              key={m}
              onClick={() => onChange({ ...state, mode: m })}
              aria-pressed={state.mode === m}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                state.mode === m
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {MODE_LABELS[m]}
            </button>
          ))}
        </div>

        {state.mode === 'every' && (
          <p className="text-xs text-slate-500">
            All values ({config.min}–{config.max}). Cron: <code className="font-mono">*</code>
          </p>
        )}

        {state.mode === 'everyN' && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-slate-700">Every</span>
            <input
              type="number"
              min={1}
              max={config.max - config.min + 1}
              value={state.step}
              onChange={(e) =>
                onChange({ ...state, step: Math.max(1, parseInt(e.target.value) || 1) })
              }
              aria-label="Step every N"
              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-700">
              {config.unit}
              {state.step === 1 ? '' : 's'}
            </span>
            <span className="text-xs text-slate-500 ml-2">
              Cron: <code className="font-mono">{state.step <= 1 ? '*' : `*/${state.step}`}</code>
            </span>
          </div>
        )}

        {state.mode === 'specific' && (
          <div>
            <div
              className="grid gap-1"
              style={{ gridTemplateColumns: `repeat(${config.cols}, minmax(0, 1fr))` }}
            >
              {range.map((v) => {
                const selected = state.values.includes(v);
                return (
                  <button
                    key={v}
                    onClick={() => toggleValue(v)}
                    aria-pressed={selected}
                    className={`px-1 py-1 text-xs rounded transition-colors ${
                      selected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {formatLabel(v)}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
              <span>{state.values.length} selected</span>
              {state.values.length > 0 && (
                <button
                  onClick={() => onChange({ ...state, values: [] })}
                  className="text-slate-500 hover:text-slate-700 underline"
                >
                  Clear
                </button>
              )}
            </div>
            {state.values.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                No values selected — falls back to <code className="font-mono">*</code>
              </p>
            )}
          </div>
        )}

        {state.mode === 'range' && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-slate-700">From</span>
            <select
              value={state.rangeStart}
              onChange={(e) => onChange({ ...state, rangeStart: parseInt(e.target.value) })}
              aria-label="Range start"
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {range.map((v) => (
                <option key={v} value={v}>
                  {formatLabel(v)}
                </option>
              ))}
            </select>
            <span className="text-sm text-slate-700">to</span>
            <select
              value={state.rangeEnd}
              onChange={(e) => onChange({ ...state, rangeEnd: parseInt(e.target.value) })}
              aria-label="Range end"
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {range.map((v) => (
                <option key={v} value={v}>
                  {formatLabel(v)}
                </option>
              ))}
            </select>
            {rangeInvalid && (
              <span className="text-xs text-red-600" role="alert">End must be ≥ start</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CronGenerator() {
  const [states, setStates] = useState<Record<string, FieldState>>(() => {
    const obj: Record<string, FieldState> = {};
    for (const f of FIELDS) obj[f.key] = defaultState(f);
    return obj;
  });
  const [timezone, setTimezone] = useState('UTC');
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const expression = FIELDS.map((f) => fieldToCron(states[f.key]!, f)).join(' ');

  const parseResult = useMemo(() => parseCron(expression), [expression]);
  const parsed: ParsedCron | null =
    parseResult && 'error' in parseResult ? null : (parseResult as ParsedCron);
  const description = parsed ? describeCron(parsed) : '';
  const error = parseResult && 'error' in parseResult ? parseResult.error : '';

  const nextRuns = useMemo(() => {
    if (!parsed) return [];
    return getNextRuns(parsed, now, 5, timezone);
  }, [parsed, now, timezone]);

  const handleReset = () => {
    const obj: Record<string, FieldState> = {};
    for (const f of FIELDS) obj[f.key] = defaultState(f);
    setStates(obj);
  };

  return (
    <ToolLayout
      title="Cron Expression Generator"
      description="Build cron expressions visually with per-field controls. No need to memorize cron syntax."
    >
      <div className="space-y-6">
        {/* Output panel */}
        <div className="bg-slate-800 text-white rounded-lg p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-400 mb-1">Generated Expression</p>
              <p className="font-mono text-2xl font-bold text-green-400 break-all">{expression}</p>
            </div>
            <div className="flex-shrink-0">
              <CopyButton text={expression} label="Copy" />
            </div>
          </div>
          {parsed ? (
            <p className="text-sm text-slate-200">{description}</p>
          ) : (
            <p className="text-sm text-amber-300">{error}</p>
          )}
          {parsed && (
            <div className="mt-3">
              <Link
                href={`/tools/cron-tester?expr=${encodeURIComponent(expression)}`}
                className="text-xs text-blue-300 hover:text-blue-200 underline"
              >
                Open in Cron Tester →
              </Link>
            </div>
          )}
        </div>

        {/* Field controls */}
        <div className="space-y-3">
          {FIELDS.map((f) => (
            <FieldCard
              key={f.key}
              config={f}
              state={states[f.key]!}
              onChange={(s) => setStates({ ...states, [f.key]: s })}
            />
          ))}
        </div>

        <div className="flex items-center justify-end">
          <Button label="Reset all fields" variant="secondary" onClick={handleReset} />
        </div>

        {/* Next runs */}
        {parsed && (
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
            <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
              <h3 className="text-sm font-semibold text-slate-700">Next 5 Runs</h3>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                aria-label="Timezone"
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CRON_TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
            {nextRuns.length === 0 ? (
              <p className="text-sm text-slate-500">No upcoming runs found within the next 6 years.</p>
            ) : (
              <ol className="space-y-1">
                {nextRuns.map((d, i) => (
                  <li
                    key={d.getTime()}
                    className="flex items-center justify-between gap-3 py-2 border-b border-slate-200 last:border-0"
                  >
                    <span className="text-xs font-medium text-slate-500 w-6 flex-shrink-0">
                      #{i + 1}
                    </span>
                    <span className="font-mono text-sm text-slate-800 flex-1 min-w-0 truncate">
                      {formatRun(d, timezone)}
                    </span>
                    <span className="text-xs text-slate-500 flex-shrink-0">
                      {relativeFromNow(d)}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
