'use client';

import { useMemo, useState } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import { computeTextStats, formatReadingTime } from '../../../utils/textStats';

function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 hover:border-blue-300 transition-colors">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">{value}</div>
      {hint && <div className="mt-0.5 text-xs text-slate-400">{hint}</div>}
    </div>
  );
}

function TextStatistics() {
  const [input, setInput] = useState('');
  const stats = useMemo(() => computeTextStats(input), [input]);

  return (
    <ToolLayout
      title="Text Statistics"
      description="Count characters, words, sentences, lines, paragraphs, and estimate read time"
    >
      <div className="space-y-6">
        <TextArea
          value={input}
          onChange={setInput}
          label="Input"
          placeholder="Paste or type text — counts update live"
          rows={10}
        />

        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Counts</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <StatCard label="Characters" value={stats.characters} />
            <StatCard label="No spaces" value={stats.charactersNoSpaces} />
            <StatCard label="Letters" value={stats.letters} />
            <StatCard label="Digits" value={stats.digits} />
            <StatCard label="Words" value={stats.words} />
            <StatCard label="Sentences" value={stats.sentences} />
            <StatCard label="Paragraphs" value={stats.paragraphs} />
            <StatCard label="Lines" value={stats.lines} />
            <StatCard label="Non-empty lines" value={stats.nonEmptyLines} />
            <StatCard label="Whitespace" value={stats.whitespaceChars} />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Averages & timing</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <StatCard
              label="Avg word length"
              value={stats.averageWordLength.toFixed(2)}
              hint="characters per word"
            />
            <StatCard
              label="Avg sentence"
              value={stats.averageSentenceLengthWords.toFixed(2)}
              hint="words per sentence"
            />
            <StatCard
              label="Reading time"
              value={stats.words === 0 ? '—' : formatReadingTime(stats.readingTimeMinutes)}
              hint="based on 200 wpm"
            />
            <StatCard
              label="Longest word"
              value={stats.longestWord || '—'}
              hint={stats.longestWord ? `${stats.longestWord.length} chars` : undefined}
            />
          </div>
        </section>
      </div>
    </ToolLayout>
  );
}

export default TextStatistics;