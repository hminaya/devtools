'use client';

import { useMemo, useState } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import CopyButton from '../../shared/CopyButton';
import Button from '../../shared/Button';
import { encodeMorse, decodeMorse, MORSE_REFERENCE } from '../../../utils/morse';

function MorseCodeTranslator() {
  const [direction, setDirection] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState('SOS HELLO WORLD');

  const output = useMemo(() => {
    if (!input) return '';
    return direction === 'encode' ? encodeMorse(input) : decodeMorse(input);
  }, [input, direction]);

  const handleSwap = () => {
    setDirection((d) => d === 'encode' ? 'decode' : 'encode');
    setInput(output);
  };

  const clear = () => {
    setInput('');
  };

  return (
    <ToolLayout
      title="Morse Code Translator"
      description="Convert text to ITU-R M.1677-1 Morse code and back — supports letters, digits, common punctuation, and word breaks"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setDirection('encode')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium border transition-colors ${
              direction === 'encode'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}
          >
            Text → Morse
          </button>
          <button
            onClick={() => setDirection('decode')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium border transition-colors ${
              direction === 'decode'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}
          >
            Morse → Text
          </button>
          <Button label="↔ Swap" onClick={handleSwap} variant="secondary" />
          <Button label="Clear" onClick={clear} variant="secondary" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TextArea
            value={input}
            onChange={setInput}
            label={direction === 'encode' ? 'Input text' : 'Input Morse (letters separated by space, words by " / ")'}
            placeholder={direction === 'encode' ? 'Type text to encode' : '... --- ... / .... . .-.. .-.. ---'}
            rows={8}
          />
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-slate-700">
                {direction === 'encode' ? 'Morse code' : 'Decoded text'}
              </label>
              {output && <CopyButton text={output} label="Copy" />}
            </div>
            <pre className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-mono text-sm leading-6 text-slate-900 whitespace-pre-wrap break-words min-h-[200px]">
              {output || <span className="text-slate-400">(empty)</span>}
            </pre>
          </div>
        </div>

        <details className="rounded-xl border border-slate-200 bg-white p-4">
          <summary className="cursor-pointer text-sm font-semibold text-slate-800">
            Morse code reference ({MORSE_REFERENCE.length} symbols)
          </summary>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {MORSE_REFERENCE.map(({ char, morse }) => (
              <div
                key={char + morse}
                className="flex items-baseline justify-between rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5"
              >
                <span className="font-mono text-sm font-semibold text-slate-900">{char}</span>
                <span className="font-mono text-xs text-slate-600">{morse}</span>
              </div>
            ))}
          </div>
        </details>
      </div>
    </ToolLayout>
  );
}

export default MorseCodeTranslator;