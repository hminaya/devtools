'use client';

import { useState, useEffect } from 'react';
import ToolLayout from '../ToolLayout';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import {
  epochToHuman,
  humanToEpoch,
  getCurrentEpoch,
  detectUnit,
  TIMEZONES,
  type Unit,
  type HumanResult,
  type EpochResult,
} from '../../../utils/unixTimestamp';

function ResultRow({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-slate-100 last:border-0">
      <span className="text-xs font-medium text-slate-500 flex-shrink-0 w-36">{label}</span>
      <span className={`text-sm text-slate-800 flex-1 min-w-0 ${mono ? 'font-mono break-all' : ''}`}>{value}</span>
      <div className="flex-shrink-0">
        <CopyButton text={value} label="Copy" />
      </div>
    </div>
  );
}

export default function UnixTimestamp() {
  const [mode, setMode] = useState<'epoch-to-human' | 'human-to-epoch'>('epoch-to-human');
  const [epochInput, setEpochInput] = useState('');
  const [unit, setUnit] = useState<Unit>('auto');
  const [timezone, setTimezone] = useState('UTC');
  const [dateInput, setDateInput] = useState('');
  const [humanResult, setHumanResult] = useState<HumanResult | null>(null);
  const [epochResult, setEpochResult] = useState<EpochResult | null>(null);
  const [error, setError] = useState('');
  const [currentEpoch, setCurrentEpoch] = useState(getCurrentEpoch());

  // Live clock
  useEffect(() => {
    const id = setInterval(() => setCurrentEpoch(getCurrentEpoch()), 1000);
    return () => clearInterval(id);
  }, []);

  // Convert epoch → human whenever inputs change
  useEffect(() => {
    if (mode !== 'epoch-to-human' || !epochInput.trim()) {
      setHumanResult(null);
      setError('');
      return;
    }
    const result = epochToHuman(epochInput, unit, timezone);
    if ('error' in result) {
      setError(result.error);
      setHumanResult(null);
    } else {
      setHumanResult(result);
      setError('');
    }
  }, [epochInput, unit, timezone, mode]);

  // Convert human → epoch whenever date input changes
  useEffect(() => {
    if (mode !== 'human-to-epoch' || !dateInput.trim()) {
      setEpochResult(null);
      setError('');
      return;
    }
    const result = humanToEpoch(dateInput);
    if ('error' in result) {
      setError(result.error);
      setEpochResult(null);
    } else {
      setEpochResult(result);
      setError('');
    }
  }, [dateInput, mode]);

  const handleUseNow = () => {
    const { seconds } = getCurrentEpoch();
    setEpochInput(seconds.toString());
    setUnit('seconds');
    setMode('epoch-to-human');
  };

  const handleClear = () => {
    setEpochInput('');
    setDateInput('');
    setHumanResult(null);
    setEpochResult(null);
    setError('');
  };

  const detectedUnit = epochInput ? detectUnit(epochInput) : null;

  return (
    <ToolLayout
      title="Unix Timestamp Converter"
      description="Convert between Unix epoch timestamps and human-readable dates with timezone support"
    >
      <div className="space-y-6">
        {/* Live clock */}
        <div className="bg-slate-800 text-white rounded-lg p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-slate-400 mb-1">Current Unix Time</p>
              <div className="flex flex-wrap gap-4">
                <div>
                  <span className="font-mono text-xl font-bold text-green-400">
                    {currentEpoch.seconds.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400 ml-2">seconds</span>
                </div>
                <div>
                  <span className="font-mono text-lg text-slate-300">
                    {currentEpoch.milliseconds.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400 ml-2">ms</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleUseNow}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors"
            >
              Use Now →
            </button>
          </div>
        </div>

        {/* Mode tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => { setMode('epoch-to-human'); setError(''); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === 'epoch-to-human' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Epoch → Human
          </button>
          <button
            onClick={() => { setMode('human-to-epoch'); setError(''); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === 'human-to-epoch' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Human → Epoch
          </button>
          <div className="flex-1" />
          <Button label="Clear" onClick={handleClear} variant="secondary" />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Epoch → Human */}
        {mode === 'epoch-to-human' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Unix Timestamp</label>
                <input
                  type="text"
                  value={epochInput}
                  onChange={(e) => setEpochInput(e.target.value)}
                  placeholder="e.g. 1710499200 or 1710499200000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {epochInput && detectedUnit && unit === 'auto' && (
                  <p className="text-xs text-slate-400 mt-1">
                    Auto-detected: <span className="font-medium text-slate-600">{detectedUnit}</span>
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as Unit)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="auto">Auto-detect</option>
                  <option value="seconds">Seconds</option>
                  <option value="milliseconds">Milliseconds</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>

            {humanResult && (
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Result</h3>
                <div>
                  <ResultRow label="ISO 8601" value={humanResult.iso8601} />
                  <ResultRow label="UTC String" value={humanResult.utcString} />
                  <ResultRow label="Date" value={humanResult.formatted} mono={false} />
                  <ResultRow label="Time" value={`${humanResult.time} (${timezone})`} />
                  <ResultRow label="Day of Week" value={humanResult.dayOfWeek} mono={false} />
                  <ResultRow label="Relative" value={humanResult.relative} mono={false} />
                  <ResultRow label="Epoch (seconds)" value={humanResult.epochSeconds} />
                  <ResultRow label="Epoch (ms)" value={humanResult.epochMilliseconds} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Human → Epoch */}
        {mode === 'human-to-epoch' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date / Time String</label>
              <input
                type="text"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                placeholder="e.g. 2024-03-15T14:30:00Z or March 15, 2024 2:30 PM"
                className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-400 mt-1">
                ISO 8601 is most reliable. Without a timezone suffix, the browser's local time is assumed.
              </p>
            </div>

            {epochResult && (
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Result</h3>
                <ResultRow label="Seconds" value={epochResult.seconds} />
                <ResultRow label="Milliseconds" value={epochResult.milliseconds} />
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
