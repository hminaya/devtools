'use client';

import { useEffect, useMemo, useState } from 'react';
import ToolLayout from '../ToolLayout';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import {
  parseCron,
  describeCron,
  getNextRuns,
  formatRun,
  relativeFromNow,
  CRON_PRESETS,
  CRON_TIMEZONES,
  type ParsedCron,
} from '../../../utils/cron';

const FIELD_LABELS = ['Minute', 'Hour', 'Day (Month)', 'Month', 'Day (Week)'];
const FIELD_RANGES = ['0-59', '0-23', '1-31', '1-12', '0-6 (Sun=0)'];

export default function CronTester() {
  const [expression, setExpression] = useState('*/15 9-17 * * 1-5');
  const [timezone, setTimezone] = useState('UTC');
  const [now, setNow] = useState(() => new Date());

  // Tick every 30s so "next run" relative times stay fresh
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  // Read ?expr= from URL on mount so the generator can deep-link here
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const exprParam = new URLSearchParams(window.location.search).get('expr');
    if (exprParam) setExpression(exprParam);
  }, []);

  const parseResult = useMemo(() => parseCron(expression), [expression]);
  const parsed: ParsedCron | null = parseResult && 'error' in parseResult ? null : (parseResult as ParsedCron);
  const error = parseResult && 'error' in parseResult ? parseResult.error : '';

  const description = useMemo(() => (parsed ? describeCron(parsed) : ''), [parsed]);

  const nextRuns = useMemo(() => {
    if (!parsed) return [];
    try {
      return getNextRuns(parsed, now, 7, timezone);
    } catch {
      return [];
    }
  }, [parsed, now, timezone]);

  const fields = expression.trim().split(/\s+/);
  const showFieldRow = fields.length === 5;

  return (
    <ToolLayout
      title="Cron Expression Tester"
      description="Parse and test cron expressions, see them explained in plain English, and view upcoming run times in any timezone"
    >
      <div className="space-y-6">
        {/* Expression input */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Cron Expression</label>
          <input
            type="text"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            placeholder="* * * * *"
            spellCheck={false}
            aria-label="Cron expression"
            className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-slate-400 mt-1">
            5 fields: minute hour day-of-month month day-of-week. Supports <code className="font-mono">*</code>,{' '}
            <code className="font-mono">,</code>, <code className="font-mono">-</code>, <code className="font-mono">/</code>,
            month/day names, and <code className="font-mono">@hourly</code>, <code className="font-mono">@daily</code>, etc.
          </p>
        </div>

        {/* Field labels */}
        {showFieldRow && (
          <div className="grid grid-cols-5 gap-2 -mt-3">
            {FIELD_LABELS.map((label, i) => (
              <div key={label} className="text-center">
                <div className="font-mono text-sm text-slate-700 bg-slate-100 rounded py-1 truncate">
                  {fields[i]}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">{label}</div>
                <div className="text-[10px] text-slate-400">{FIELD_RANGES[i]}</div>
              </div>
            ))}
          </div>
        )}

        {/* Error / Description */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-3" role="alert">
            <p className="text-red-700 text-sm">
              <span className="font-medium">Error:</span> {error}
            </p>
          </div>
        ) : (
          parsed && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-blue-700 uppercase tracking-wide mb-1">
                    Plain English
                  </p>
                  <p className="text-base text-slate-800">{description}</p>
                </div>
                <CopyButton text={description} label="Copy" />
              </div>
            </div>
          )
        )}

        {/* Presets */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Common Patterns</label>
          <div className="flex flex-wrap gap-2">
            {CRON_PRESETS.map((preset) => (
              <button
                key={preset.expr}
                onClick={() => setExpression(preset.expr)}
                aria-pressed={expression.trim() === preset.expr}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  expression.trim() === preset.expr
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                title={preset.expr}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Timezone for Next Run Times</label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            aria-label="Timezone"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CRON_TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>

        {/* Next runs */}
        {parsed && (
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-700">Next 7 Runs</h3>
              <Button
                label="Refresh"
                variant="secondary"
                onClick={() => setNow(new Date())}
              />
            </div>
            {nextRuns.length === 0 ? (
              <p className="text-sm text-slate-500">
                No upcoming runs found within the next 6 years.
              </p>
            ) : (
              <ol className="space-y-1">
                {nextRuns.map((d, i) => (
                  <li
                    key={d.getTime()}
                    className="flex items-center justify-between gap-3 py-2 border-b border-slate-200 last:border-0"
                  >
                    <span className="text-xs font-medium text-slate-500 w-6 flex-shrink-0">#{i + 1}</span>
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

        {/* Syntax reference */}
        <details className="border border-slate-200 rounded-lg p-4">
          <summary className="cursor-pointer text-sm font-semibold text-slate-700">
            Syntax Reference
          </summary>
          <div className="mt-3 text-sm text-slate-700 space-y-2">
            <p><code className="font-mono bg-slate-100 px-1 rounded">*</code> — every value</p>
            <p><code className="font-mono bg-slate-100 px-1 rounded">a,b,c</code> — list of specific values</p>
            <p><code className="font-mono bg-slate-100 px-1 rounded">a-b</code> — range from a through b</p>
            <p><code className="font-mono bg-slate-100 px-1 rounded">*/n</code> — every n values</p>
            <p><code className="font-mono bg-slate-100 px-1 rounded">a-b/n</code> — every n in range a-b</p>
            <p><code className="font-mono bg-slate-100 px-1 rounded">JAN-DEC</code> — month names accepted</p>
            <p><code className="font-mono bg-slate-100 px-1 rounded">SUN-SAT</code> — weekday names (SUN=0, SAT=6)</p>
            <p>
              Macros:{' '}
              <code className="font-mono bg-slate-100 px-1 rounded">@hourly</code>,{' '}
              <code className="font-mono bg-slate-100 px-1 rounded">@daily</code>,{' '}
              <code className="font-mono bg-slate-100 px-1 rounded">@weekly</code>,{' '}
              <code className="font-mono bg-slate-100 px-1 rounded">@monthly</code>,{' '}
              <code className="font-mono bg-slate-100 px-1 rounded">@yearly</code>,{' '}
              <code className="font-mono bg-slate-100 px-1 rounded">@midnight</code>
            </p>
            <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
              Note: when both day-of-month and day-of-week are restricted, a day matches if{' '}
              <em>either</em> matches (POSIX behavior).
            </p>
          </div>
        </details>
      </div>
    </ToolLayout>
  );
}
