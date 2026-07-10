'use client';

import { useState, useEffect } from 'react';
import ToolLayout from '../ToolLayout';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import CodeDisplay from '../../shared/CodeDisplay';
import {
  generateRandomNumber,
  generateCodeTemplate,
  LANGUAGE_OPTIONS,
  type Language,
} from '../../../utils/randomNumber';

function RandomNumberGenerator() {
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(100);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('typescript');
  const [generated, setGenerated] = useState<number | null>(null);
  const [codeSample, setCodeSample] = useState('');

  // Update code sample when parameters or language changes
  useEffect(() => {
    const code = generateCodeTemplate(selectedLanguage, minValue, maxValue);
    setCodeSample(code);
  }, [selectedLanguage, minValue, maxValue]);

  // Generate a random number
  const handleGenerate = () => {
    const num = generateRandomNumber(minValue, maxValue);
    setGenerated(num);
  };

  // Handle min change with auto-swap logic
  const handleMinChange = (value: number) => {
    if (value > maxValue) {
      setMaxValue(value);
    }
    setMinValue(value);
  };

  // Handle max change with auto-swap logic
  const handleMaxChange = (value: number) => {
    if (value < minValue) {
      setMinValue(value);
    }
    setMaxValue(value);
  };

  return (
    <ToolLayout
      title="Random Number Generator"
      description="Generate random numbers within a custom range and view code samples in multiple languages"
    >
      <div className="space-y-6">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            label="Generate Random Number"
            onClick={handleGenerate}
            variant="primary"
          />
          {generated !== null && (
            <CopyButton text={generated.toString()} label="Copy Number" />
          )}
        </div>

        {/* Range Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Minimum Value
            </label>
            <input
              type="number"
              value={minValue}
              onChange={(e) => handleMinChange(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Maximum Value
            </label>
            <input
              type="number"
              value={maxValue}
              onChange={(e) => handleMaxChange(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Generated Number Display */}
        {generated !== null && (
          <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
            <p className="text-sm font-medium text-slate-700 mb-2">
              Generated Number:
            </p>
            <p className="font-mono text-3xl font-bold text-slate-900">{generated}</p>
          </div>
        )}

        {/* Language Selector */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Code Sample Language
          </label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value as Language)}
            className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {LANGUAGE_OPTIONS.map((lang) => (
              <option key={lang.language} value={lang.language}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Code Sample Display */}
        {codeSample && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-slate-700">
                How to Generate in Code
              </label>
              <CopyButton text={codeSample} label="Copy Code" />
            </div>
            <CodeDisplay
              code={codeSample}
              language={selectedLanguage === 'csharp' ? 'csharp' : selectedLanguage}
            />
          </div>
        )}

        {/* Info Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
          <p className="text-slate-700 text-sm">
            <strong>Tip:</strong> The generated number is inclusive of both min and max
            values. The code sample updates automatically as you change the language or
            range.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}

export default RandomNumberGenerator;
