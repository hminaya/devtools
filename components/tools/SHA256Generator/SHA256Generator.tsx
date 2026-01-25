'use client';

import { useState } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import { generateSHA, type SHAAlgorithm } from '../../../utils/sha256';

function SHA256Generator() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [algorithm, setAlgorithm] = useState<SHAAlgorithm>('SHA-256');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateHash = async () => {
    if (input.trim()) {
      setIsGenerating(true);
      try {
        const hash = await generateSHA(input, algorithm);
        setOutput(hash);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const clear = () => {
    setInput('');
    setOutput('');
  };

  const generateRandomHash = async () => {
    // Word lists for generating random text
    const adjectives = [
      'quick', 'lazy', 'sleepy', 'noisy', 'hungry', 'brave', 'calm', 'eager',
      'gentle', 'happy', 'jolly', 'kind', 'lively', 'proud', 'silly', 'witty',
      'fancy', 'bright', 'dark', 'swift', 'clever', 'bold', 'fierce', 'wise'
    ];

    const nouns = [
      'fox', 'dog', 'cat', 'bird', 'fish', 'lion', 'tiger', 'bear', 'wolf',
      'eagle', 'shark', 'whale', 'dolphin', 'rabbit', 'deer', 'horse', 'cow',
      'elephant', 'monkey', 'penguin', 'owl', 'snake', 'frog', 'turtle'
    ];

    const verbs = [
      'jumps', 'runs', 'walks', 'flies', 'swims', 'climbs', 'sleeps', 'eats',
      'plays', 'dances', 'sings', 'laughs', 'thinks', 'dreams', 'works', 'reads'
    ];

    // Generate random sentence with 3-6 words
    const wordCount = Math.floor(Math.random() * 4) + 3;
    const words: string[] = [];

    for (let i = 0; i < wordCount; i++) {
      if (i === 0) {
        // Start with adjective + noun
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        words.push(adj!, noun!);
        i++; // Skip next iteration since we added 2 words
      } else if (i === 2) {
        // Add a verb
        words.push(verbs[Math.floor(Math.random() * verbs.length)]!);
      } else {
        // Add adjective or noun randomly
        const useAdjective = Math.random() > 0.5;
        if (useAdjective) {
          words.push(adjectives[Math.floor(Math.random() * adjectives.length)]!);
        } else {
          words.push(nouns[Math.floor(Math.random() * nouns.length)]!);
        }
      }
    }

    // Capitalize first word and join
    const randomText = words.map((word, i) =>
      i === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word
    ).join(' ');

    // Hash the random text
    setIsGenerating(true);
    try {
      const hash = await generateSHA(randomText, algorithm);
      setInput(randomText);
      setOutput(hash);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ToolLayout
      title="SHA-256/512 Hash"
      description="Generate secure SHA-256 or SHA-512 hashes from text"
    >
      <div className="space-y-4">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 items-center">
          <Button
            label={isGenerating ? 'Generating...' : `Generate ${algorithm} Hash`}
            onClick={generateHash}
            variant="primary"
          />
          <Button label="Generate Random Hash" onClick={generateRandomHash} variant="secondary" />
          <Button label="Clear" onClick={clear} variant="secondary" />

          {/* Algorithm Toggle */}
          <div className="flex items-center gap-2 ml-auto">
            <label className="text-sm font-medium text-slate-700">Algorithm:</label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value as SHAAlgorithm)}
              className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="SHA-256">SHA-256 (64 chars)</option>
              <option value="SHA-512">SHA-512 (128 chars)</option>
            </select>
          </div>
        </div>

        {/* Info Note */}
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-green-800 text-sm">
            <strong>SHA-256</strong> and <strong>SHA-512</strong> are cryptographically secure hash functions.
            SHA-256 produces a 256-bit (64 character) hash, SHA-512 produces a 512-bit (128 character) hash.
          </p>
        </div>

        {/* Side by Side Input/Output */}
        <div className="grid grid-cols-2 gap-4">
          {/* Input Column */}
          <div className="space-y-2">
            <TextArea
              value={input}
              onChange={setInput}
              label="Input Text"
              placeholder="Enter text to hash"
              rows={30}
            />
          </div>

          {/* Output Column */}
          <div className="space-y-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">{algorithm} Hash</label>
              {output ? (
                <div className="space-y-3">
                  <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
                    <p className="font-mono text-sm text-slate-900 break-all">{output}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <CopyButton text={output} label="Copy Hash" />
                    <span className="text-xs text-slate-500">{output.length} characters</span>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-md p-4 h-full flex items-center justify-center">
                  <p className="text-slate-400">{algorithm} hash will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}

export default SHA256Generator;
