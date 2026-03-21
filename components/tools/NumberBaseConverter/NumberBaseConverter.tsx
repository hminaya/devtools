'use client';

import { useState } from 'react';
import ToolLayout from '../ToolLayout';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import {
  convertBase,
  getValidCharsHint,
  BASE_LABELS,
  BASE_NAMES,
  SAMPLE_VALUES,
  type Base,
  type BaseConversionResult,
} from '../../../utils/numberBaseConverter';

const BASES: Base[] = [2, 8, 10, 16];

const BASE_COLORS: Record<Base, string> = {
  2:  'border-purple-300 bg-purple-50',
  8:  'border-amber-300 bg-amber-50',
  10: 'border-blue-300 bg-blue-50',
  16: 'border-green-300 bg-green-50',
};

const BASE_ACTIVE_COLORS: Record<Base, string> = {
  2:  'bg-purple-600 text-white border-purple-600',
  8:  'bg-amber-500 text-white border-amber-500',
  10: 'bg-blue-600 text-white border-blue-600',
  16: 'bg-green-600 text-white border-green-600',
};

const BASE_VALUE_COLORS: Record<Base, string> = {
  2:  'text-purple-700',
  8:  'text-amber-700',
  10: 'text-blue-700',
  16: 'text-green-700',
};

function getResultValue(result: BaseConversionResult, base: Base): string {
  switch (base) {
    case 2:  return result.binary;
    case 8:  return result.octal;
    case 10: return result.decimal;
    case 16: return result.hex;
  }
}

export default function NumberBaseConverter() {
  const [input, setInput] = useState('');
  const [fromBase, setFromBase] = useState<Base>(10);
  const [sampleIndex, setSampleIndex] = useState(0);

  const result = convertBase(input, fromBase);

  const handleBaseChange = (base: Base) => {
    // If there's a valid result, convert the current value to the new base and keep it
    if (input && !result.error && result.decimal) {
      const newValue = getResultValue(result, base);
      setInput(newValue);
    }
    setFromBase(base);
  };

  const handleCardClick = (base: Base) => {
    if (base === fromBase) return;
    const value = getResultValue(result, base);
    if (value) {
      setInput(value);
      setFromBase(base);
    }
  };

  const handleLoadSample = () => {
    const sample = SAMPLE_VALUES[sampleIndex % SAMPLE_VALUES.length]!;
    setInput(sample.value);
    setFromBase(sample.base);
    setSampleIndex((i) => i + 1);
  };

  const handleClear = () => {
    setInput('');
  };

  const hasResult = input && !result.error && result.decimal !== '';

  return (
    <ToolLayout
      title="Number Base Converter"
      description="Convert numbers between binary, octal, decimal, and hexadecimal"
    >
      <div className="space-y-6">
        {/* Base selector + input */}
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {BASES.map((base) => (
              <button
                key={base}
                onClick={() => handleBaseChange(base)}
                className={`px-4 py-2 rounded-md text-sm font-mono font-bold border transition-colors ${
                  fromBase === base
                    ? BASE_ACTIVE_COLORS[base]
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {BASE_LABELS[base]} <span className="font-sans font-normal opacity-70">({base})</span>
              </button>
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-slate-700">
                Input <span className="text-slate-400 font-normal">— {BASE_NAMES[fromBase]} (base {fromBase})</span>
              </label>
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Enter a ${BASE_NAMES[fromBase].toLowerCase()} number...`}
              className={`w-full px-3 py-2 border rounded-md shadow-sm font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                result.error ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
            />
            {result.error ? (
              <p className="text-red-600 text-xs mt-1">{result.error}. {getValidCharsHint(fromBase)}.</p>
            ) : (
              <p className="text-slate-400 text-xs mt-1">{getValidCharsHint(fromBase)}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button label="Load Sample" onClick={handleLoadSample} variant="secondary" />
            <Button label="Clear" onClick={handleClear} variant="secondary" />
          </div>
        </div>

        {/* Results grid */}
        {hasResult && (
          <div className="grid grid-cols-2 gap-3">
            {BASES.map((base) => {
              const value = getResultValue(result, base);
              const isActive = fromBase === base;

              return (
                <div
                  key={base}
                  onClick={() => handleCardClick(base)}
                  className={`border rounded-lg p-4 transition-all ${BASE_COLORS[base]} ${
                    isActive ? 'ring-2 ring-offset-1 ring-slate-400' : 'cursor-pointer hover:shadow-sm'
                  }`}
                  title={isActive ? 'Current input base' : `Click to use as ${BASE_NAMES[base]} input`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                      {BASE_NAMES[base]} (base {base})
                    </span>
                    <div className="flex items-center gap-1">
                      {isActive && (
                        <span className="text-xs text-slate-400 italic">active</span>
                      )}
                      <div onClick={(e) => e.stopPropagation()}>
                        <CopyButton text={value} label="Copy" />
                      </div>
                    </div>
                  </div>
                  <p className={`font-mono text-lg font-bold break-all leading-tight ${BASE_VALUE_COLORS[base]}`}>
                    {value || '—'}
                  </p>
                  {base === 2 && result.bitCount > 0 && (
                    <p className="text-xs text-slate-400 mt-1">{result.bitCount} bit{result.bitCount !== 1 ? 's' : ''}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Two's complement */}
        {hasResult && (
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
            <h3 className="text-sm font-semibold text-slate-800 mb-1">Two's Complement</h3>
            <p className="text-xs text-slate-500 mb-3">
              Binary representation of signed integers. Negative numbers are encoded so addition and subtraction work uniformly.
            </p>
            <div className="space-y-2">
              {([8, 16, 32] as const).map((bits) => {
                const tc = bits === 32 ? result.twosComplement32 : bits === 16 ? result.twosComplement16 : result.twosComplement8;
                const inRange = tc !== null && tc !== '';

                return (
                  <div key={bits} className="flex items-center gap-3">
                    <span className="text-xs font-medium text-slate-600 w-12 flex-shrink-0">{bits}-bit</span>
                    {inRange ? (
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <code className="font-mono text-xs text-slate-800 bg-white border border-slate-200 rounded px-2 py-1 break-all flex-1">
                          {tc}
                        </code>
                        <div className="flex-shrink-0">
                          <CopyButton text={tc!} label="Copy" />
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        Out of range [{bits === 8 ? '−128 to 127' : bits === 16 ? '−32,768 to 32,767' : '−2,147,483,648 to 2,147,483,647'}]
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {input && !result.error && !hasResult && (
          <div className="text-center py-6 text-slate-400 text-sm">
            Enter a valid number to see conversions.
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
