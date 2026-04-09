'use client';

import { useState } from 'react';
import ToolLayout from '../ToolLayout';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import {
  generatePassword,
  generatePassphrase,
  calculateStrength,
  type StrengthResult,
  type PassphraseOptions,
} from '../../../utils/password';

type Mode = 'password' | 'passphrase';

const STRENGTH_COLORS: Record<StrengthResult['level'], string> = {
  'weak': 'bg-red-500',
  'fair': 'bg-yellow-500',
  'strong': 'bg-green-500',
  'very-strong': 'bg-emerald-600',
};

const STRENGTH_TEXT_COLORS: Record<StrengthResult['level'], string> = {
  'weak': 'text-red-700',
  'fair': 'text-yellow-700',
  'strong': 'text-green-700',
  'very-strong': 'text-emerald-700',
};

const STRENGTH_BAR_WIDTHS: Record<StrengthResult['level'], string> = {
  'weak': 'w-1/4',
  'fair': 'w-2/4',
  'strong': 'w-3/4',
  'very-strong': 'w-full',
};

function PasswordGenerator() {
  const [mode, setMode] = useState<Mode>('password');
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  const [passphraseOptions, setPassphraseOptions] = useState<PassphraseOptions>({
    wordCount: 4,
    separator: '-',
    capitalize: true,
    includeNumber: true,
  });
  const [output, setOutput] = useState('');
  const [strength, setStrength] = useState<StrengthResult | null>(null);
  const [error, setError] = useState('');

  const handleGenerate = () => {
    try {
      let result: string;
      let strengthResult: StrengthResult;

      if (mode === 'password') {
        result = generatePassword({ length, ...options });
        strengthResult = calculateStrength(result, 'password');
      } else {
        result = generatePassphrase(passphraseOptions);
        strengthResult = calculateStrength(result, 'passphrase', passphraseOptions);
      }

      setOutput(result);
      setStrength(strengthResult);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate');
      setOutput('');
      setStrength(null);
    }
  };

  const handleOptionChange = (option: keyof typeof options) => {
    setOptions((prev) => ({ ...prev, [option]: !prev[option] }));
  };

  const atLeastOneSelected = Object.values(options).some((val) => val);

  return (
    <ToolLayout
      title="Password Generator"
      description="Generate secure random passwords and memorable passphrases"
    >
      <div className="space-y-6">
        {/* Mode Toggle */}
        <div className="flex rounded-lg border border-slate-200 overflow-hidden">
          <button
            onClick={() => setMode('password')}
            className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
              mode === 'password'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            Random Password
          </button>
          <button
            onClick={() => setMode('passphrase')}
            className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
              mode === 'passphrase'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            Passphrase
          </button>
        </div>

        {mode === 'password' ? (
          <>
            {/* Length Control */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password Length: {length}
              </label>
              <input
                type="range"
                min="8"
                max="64"
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>8</span>
                <span>64</span>
              </div>
            </div>

            {/* Character Options */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Character Types
              </label>
              <div className="space-y-2">
                {[
                  { key: 'uppercase', label: 'Uppercase Letters (A-Z)' },
                  { key: 'lowercase', label: 'Lowercase Letters (a-z)' },
                  { key: 'numbers', label: 'Numbers (0-9)' },
                  { key: 'symbols', label: 'Symbols (!@#$%^&*)' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options[key as keyof typeof options]}
                      onChange={() => handleOptionChange(key as keyof typeof options)}
                      className="w-4 h-4 text-blue-500 bg-slate-100 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-slate-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Word Count */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Number of Words: {passphraseOptions.wordCount}
              </label>
              <input
                type="range"
                min="3"
                max="8"
                value={passphraseOptions.wordCount}
                onChange={(e) => setPassphraseOptions(prev => ({ ...prev, wordCount: Number(e.target.value) }))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>3</span>
                <span>8</span>
              </div>
            </div>

            {/* Separator */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Separator</label>
              <div className="flex gap-2">
                {[
                  { value: '-', label: 'Hyphen (-)' },
                  { value: '.', label: 'Dot (.)' },
                  { value: '_', label: 'Underscore (_)' },
                  { value: ' ', label: 'Space' },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setPassphraseOptions(prev => ({ ...prev, separator: value }))}
                    className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                      passphraseOptions.separator === value
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Passphrase Options */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={passphraseOptions.capitalize}
                  onChange={() => setPassphraseOptions(prev => ({ ...prev, capitalize: !prev.capitalize }))}
                  className="w-4 h-4 text-blue-500 bg-slate-100 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-slate-700">Capitalize Words</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={passphraseOptions.includeNumber}
                  onChange={() => setPassphraseOptions(prev => ({ ...prev, includeNumber: !prev.includeNumber }))}
                  className="w-4 h-4 text-blue-500 bg-slate-100 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-slate-700">Append a Number</span>
              </label>
            </div>
          </>
        )}

        <Button
          label={mode === 'password' ? 'Generate Password' : 'Generate Passphrase'}
          onClick={handleGenerate}
          variant="primary"
          disabled={mode === 'password' && !atLeastOneSelected}
        />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {output && (
          <div className="space-y-3">
            <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
              <p className="text-sm font-medium text-slate-700 mb-2">
                Generated {mode === 'password' ? 'Password' : 'Passphrase'}:
              </p>
              <p className="font-mono text-lg text-slate-900 break-all">{output}</p>
            </div>

            {/* Strength Meter */}
            {strength && (
              <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Strength</span>
                  <span className={`text-sm font-semibold ${STRENGTH_TEXT_COLORS[strength.level]}`}>
                    {strength.label}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${STRENGTH_COLORS[strength.level]} ${STRENGTH_BAR_WIDTHS[strength.level]}`}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Entropy: {strength.entropy} bits</span>
                  <span>Crack time: ~{strength.crackTime}</span>
                </div>
              </div>
            )}

            <CopyButton text={output} label={mode === 'password' ? 'Copy Password' : 'Copy Passphrase'} />
          </div>
        )}

        {/* How It Works */}
        <div className="border-t border-slate-200 pt-6 mt-8 space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">How It Works</h2>
          <div className="prose prose-slate prose-sm max-w-none">
            <p className="text-slate-600">
              This generator uses the <strong>Web Crypto API</strong> (<code>crypto.getRandomValues</code>) to produce
              cryptographically secure random values directly in your browser. No passwords are ever sent to a server.
            </p>

            <h3 className="text-base font-semibold text-slate-800 mt-4">Random Password</h3>
            <p className="text-slate-600">
              Each character is selected independently from your chosen character set (uppercase, lowercase, digits, symbols).
              A 16-character password with all character types enabled provides ~105 bits of entropy, which would take
              billions of years to brute-force even with modern hardware.
            </p>

            <h3 className="text-base font-semibold text-slate-800 mt-4">Passphrase</h3>
            <p className="text-slate-600">
              Passphrases string together random words (e.g., <code>Breeze-Canyon-Dragon-42</code>) to create passwords that
              are both strong and easy to remember. A 4-word passphrase provides ~30+ bits of entropy per word. Passphrases
              are especially useful for master passwords you need to type from memory.
            </p>

            <h3 className="text-base font-semibold text-slate-800 mt-4">What Makes a Password Strong?</h3>
            <ul className="text-slate-600 list-disc pl-5 space-y-1">
              <li><strong>Length matters most</strong> — each additional character multiplies the number of possible combinations exponentially</li>
              <li><strong>Use all character types</strong> — mixing uppercase, lowercase, numbers, and symbols increases the search space attackers must cover</li>
              <li><strong>Avoid patterns</strong> — dictionary words, keyboard patterns (qwerty), and personal info are tried first by attackers</li>
              <li><strong>Use unique passwords</strong> — never reuse passwords across different accounts</li>
              <li><strong>Consider a passphrase</strong> — 4+ random words are easier to remember and can be stronger than a short complex password</li>
            </ul>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}

export default PasswordGenerator;
