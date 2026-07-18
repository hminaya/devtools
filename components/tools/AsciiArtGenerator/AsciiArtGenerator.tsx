'use client';

import { useState } from 'react';
import ToolLayout from '../ToolLayout';
import CopyButton from '../../shared/CopyButton';
import Button from '../../shared/Button';
import { generateAsciiArt, FONT_NAMES, type FontName } from '../../../utils/asciiArt';

function AsciiArtGenerator() {
  const [text, setText] = useState('Hello');
  const [font, setFont] = useState<FontName>('block');
  const [letterSpacing, setLetterSpacing] = useState(1);
  const [output, setOutput] = useState('');

  const handleGenerate = () => {
    setOutput(generateAsciiArt(text, { font, letterSpacing }));
  };

  return (
    <ToolLayout
      title="ASCII Art Text Generator"
      description="Convert text to ASCII art banner with built-in block, banner, and thin fonts — no external font files, works in any browser"
      fullWidth
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[12rem]">
            <label className="block text-sm font-medium text-slate-700 mb-1">Text</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type text to convert"
              aria-label="Text"
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Font</label>
            <select
              value={font}
              onChange={(e) => setFont(e.target.value as FontName)}
              aria-label="Font"
              className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {FONT_NAMES.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Letter spacing</label>
            <input
              type="number"
              min="0"
              max="8"
              value={letterSpacing}
              onChange={(e) => setLetterSpacing(Math.max(0, Math.min(8, Number(e.target.value))))}
              aria-label="Letter spacing"
              className="w-20 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button label="Generate" onClick={handleGenerate} variant="primary" />
          {output && <CopyButton text={output} label="Copy ASCII Art" />}
        </div>

        {output ? (
          <pre className="w-full rounded-xl border border-slate-300 bg-white px-4 py-4 font-mono text-sm leading-5 text-slate-900 whitespace-pre overflow-x-auto">
            {output}
          </pre>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-400">
            ASCII art will appear here
          </div>
        )}

        <div className="bg-slate-50 border border-slate-200 rounded-md p-4 text-sm text-slate-600 space-y-1">
          <p>Supports A–Z, 0–9, common punctuation, and spaces. Letters are uppercased automatically because the fonts are uppercase-only.</p>
          <p>Output is plain text — copy it into READMEs, code comments, terminal banners, software logs, or commit messages.</p>
        </div>
      </div>
    </ToolLayout>
  );
}

export default AsciiArtGenerator;