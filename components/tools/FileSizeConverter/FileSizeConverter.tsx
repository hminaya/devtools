'use client';

import { useState, useEffect } from 'react';
import ToolLayout from '../ToolLayout';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import { convertFileSize, getAllUnits, type FileSizeUnit, type FileSizeConversions } from '../../../utils/fileSizeConversion';

interface CommonFileSize {
  name: string;
  emoji: string;
  value: number;
  unit: FileSizeUnit;
}

const COMMON_FILE_SIZES: CommonFileSize[] = [
  { name: '3.5" Floppy Disk', emoji: '💾', value: 1.44, unit: 'MB' },
  { name: 'Zip Disk', emoji: '💾', value: 100, unit: 'MB' },
  { name: 'CD', emoji: '💿', value: 700, unit: 'MB' },
  { name: 'DVD', emoji: '📀', value: 4.7, unit: 'GB' },
  { name: 'Blu-ray Disc', emoji: '💿', value: 25, unit: 'GB' },
  { name: 'Tweet (280 chars)', emoji: '🐦', value: 280, unit: 'B' },
  { name: 'Email (plain text)', emoji: '✉️', value: 10, unit: 'KB' },
  { name: 'Word Document', emoji: '📝', value: 100, unit: 'KB' },
  { name: 'Photo (JPEG)', emoji: '📷', value: 2, unit: 'MB' },
  { name: 'MP3 Song (3 min)', emoji: '🎵', value: 3, unit: 'MB' },
  { name: 'PowerPoint Presentation', emoji: '📊', value: 5, unit: 'MB' },
  { name: 'HD Movie (1080p)', emoji: '🎬', value: 4, unit: 'GB' },
  { name: '4K Movie', emoji: '🎥', value: 25, unit: 'GB' },
  { name: 'USB Flash Drive (32GB)', emoji: '💾', value: 32, unit: 'GB' },
  { name: 'Hard Drive (1TB)', emoji: '💽', value: 1, unit: 'TB' },
  { name: 'Game Console (PS5)', emoji: '🎮', value: 825, unit: 'GB' },
  { name: 'Smartphone (128GB)', emoji: '📱', value: 128, unit: 'GB' },
];

function FileSizeConverter() {
  const [value, setValue] = useState<string>('1');
  const [unit, setUnit] = useState<FileSizeUnit>('MB');
  const [conversions, setConversions] = useState<FileSizeConversions | null>(null);
  const [selectedObject, setSelectedObject] = useState<CommonFileSize | null>(null);

  const units = getAllUnits();

  useEffect(() => {
    // Convert whenever value or unit changes
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      const result = convertFileSize(numValue, unit);
      setConversions(result);
    } else {
      setConversions(null);
    }
  }, [value, unit]);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setSelectedObject(null); // Clear selected object when user manually changes value
  };

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUnit(e.target.value as FileSizeUnit);
    setSelectedObject(null); // Clear selected object when user manually changes unit
  };

  const handleClear = () => {
    setValue('1');
    setUnit('MB');
    setSelectedObject(null);
  };

  const generateRandomSize = () => {
    const randomObject = COMMON_FILE_SIZES[Math.floor(Math.random() * COMMON_FILE_SIZES.length)];

    if (randomObject) {
      setValue(randomObject.value.toString());
      setUnit(randomObject.unit);
      setSelectedObject(randomObject);
    }
  };

  const isValidInput = !isNaN(parseFloat(value)) && parseFloat(value) >= 0;

  return (
    <ToolLayout
      title="File Size Converter"
      description="Convert file sizes between decimal (SI) and binary (IEC) units"
      fullWidth
    >
      <div className="space-y-6">
        {/* Action buttons */}
        <div className="flex gap-3">
          <Button label="Clear" onClick={handleClear} variant="secondary" />
          <Button label="Random Size" onClick={generateRandomSize} variant="primary" />
        </div>

        {/* Input section */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-lg p-6">
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Enter File Size
          </label>
          <div className="flex gap-3">
            <input
              type="number"
              value={value}
              onChange={handleValueChange}
              min="0"
              step="any"
              placeholder="Enter size..."
              className={`flex-1 px-4 py-3 border-2 rounded-lg font-mono text-lg transition-colors ${
                isValidInput
                  ? 'border-slate-300 focus:border-blue-500 focus:outline-none'
                  : 'border-red-500 focus:border-red-600 focus:outline-none'
              }`}
            />
            <select
              value={unit}
              onChange={handleUnitChange}
              className="px-4 py-3 border-2 border-slate-300 rounded-lg font-medium text-slate-700 bg-white focus:border-blue-500 focus:outline-none cursor-pointer"
            >
              <optgroup label="Decimal (SI) - Base 10">
                {units.filter(u => u.type === 'SI').map(u => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Binary (IEC) - Base 2">
                {units.filter(u => u.type === 'IEC').map(u => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
          {selectedObject && (
            <div className="mt-4 flex items-center gap-3 p-3 bg-white border border-slate-300 rounded-lg">
              <span className="text-3xl">{selectedObject.emoji}</span>
              <div>
                <p className="text-sm font-semibold text-slate-900">{selectedObject.name}</p>
                <p className="text-xs text-slate-600">
                  Typical size: {selectedObject.value} {selectedObject.unit}
                </p>
              </div>
            </div>
          )}
          {!isValidInput && (
            <p className="text-red-600 text-sm mt-2">Please enter a valid positive number</p>
          )}
        </div>

        {/* Results section */}
        {conversions && isValidInput && (
          <div className="space-y-6">
            {/* Grid container for side-by-side layout */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Decimal (SI) Units */}
              <div className="bg-white border border-slate-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">
                    Decimal Units (SI) - Base 10
                  </h3>
                  <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    1 KB = 1,000 Bytes
                  </span>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bytes</div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <CopyButton text={conversions.decimal.bytes} label="" />
                    </div>
                  </div>
                  <div className="font-mono text-lg text-slate-900 break-all">
                    {conversions.decimal.bytes} B
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kilobytes</div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <CopyButton text={conversions.decimal.kilobytes} label="" />
                    </div>
                  </div>
                  <div className="font-mono text-lg text-slate-900 break-all">
                    {conversions.decimal.kilobytes} KB
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Megabytes</div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <CopyButton text={conversions.decimal.megabytes} label="" />
                    </div>
                  </div>
                  <div className="font-mono text-lg text-slate-900 break-all">
                    {conversions.decimal.megabytes} MB
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gigabytes</div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <CopyButton text={conversions.decimal.gigabytes} label="" />
                    </div>
                  </div>
                  <div className="font-mono text-lg text-slate-900 break-all">
                    {conversions.decimal.gigabytes} GB
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Terabytes</div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <CopyButton text={conversions.decimal.terabytes} label="" />
                    </div>
                  </div>
                  <div className="font-mono text-lg text-slate-900 break-all">
                    {conversions.decimal.terabytes} TB
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Petabytes</div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <CopyButton text={conversions.decimal.petabytes} label="" />
                    </div>
                  </div>
                  <div className="font-mono text-lg text-slate-900 break-all">
                    {conversions.decimal.petabytes} PB
                  </div>
                </div>
                </div>
              </div>

              {/* Binary (IEC) Units */}
              <div className="bg-white border border-slate-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">
                    Binary Units (IEC) - Base 2
                  </h3>
                  <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    1 KiB = 1,024 Bytes
                  </span>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bytes</div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <CopyButton text={conversions.binary.bytes} label="" />
                    </div>
                  </div>
                  <div className="font-mono text-lg text-slate-900 break-all">
                    {conversions.binary.bytes} B
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kibibytes</div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <CopyButton text={conversions.binary.kibibytes} label="" />
                    </div>
                  </div>
                  <div className="font-mono text-lg text-slate-900 break-all">
                    {conversions.binary.kibibytes} KiB
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mebibytes</div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <CopyButton text={conversions.binary.mebibytes} label="" />
                    </div>
                  </div>
                  <div className="font-mono text-lg text-slate-900 break-all">
                    {conversions.binary.mebibytes} MiB
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gibibytes</div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <CopyButton text={conversions.binary.gibibytes} label="" />
                    </div>
                  </div>
                  <div className="font-mono text-lg text-slate-900 break-all">
                    {conversions.binary.gibibytes} GiB
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tebibytes</div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <CopyButton text={conversions.binary.tebibytes} label="" />
                    </div>
                  </div>
                  <div className="font-mono text-lg text-slate-900 break-all">
                    {conversions.binary.tebibytes} TiB
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pebibytes</div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <CopyButton text={conversions.binary.pebibytes} label="" />
                    </div>
                  </div>
                  <div className="font-mono text-lg text-slate-900 break-all">
                    {conversions.binary.pebibytes} PiB
                  </div>
                </div>
                </div>
              </div>
            </div>

            {/* Info box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <div className="text-blue-600 text-2xl">ℹ️</div>
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">Unit Systems Explained</h4>
                  <p className="text-sm text-blue-800">
                    <strong>Decimal (SI)</strong> uses powers of 1,000 (e.g., 1 KB = 1,000 bytes).
                    <strong className="ml-2">Binary (IEC)</strong> uses powers of 1,024 (e.g., 1 KiB = 1,024 bytes).
                    Most operating systems use binary units internally but often label them with decimal abbreviations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export default FileSizeConverter;
