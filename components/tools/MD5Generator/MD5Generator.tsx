'use client';

import { useState } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import { generateMD5 } from '../../../utils/md5';

function MD5Generator() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const generateHash = () => {
    if (input.trim()) {
      const hash = generateMD5(input);
      setOutput(hash);
    }
  };

  const clear = () => {
    setInput('');
    setOutput('');
  };

  const generateRandomHash = () => {
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
    const words = [];

    for (let i = 0; i < wordCount; i++) {
      if (i === 0) {
        // Start with adjective + noun
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        words.push(adj, noun);
        i++; // Skip next iteration since we added 2 words
      } else if (i === 2) {
        // Add a verb
        words.push(verbs[Math.floor(Math.random() * verbs.length)]);
      } else {
        // Add adjective or noun randomly
        const useAdjective = Math.random() > 0.5;
        if (useAdjective) {
          words.push(adjectives[Math.floor(Math.random() * adjectives.length)]);
        } else {
          words.push(nouns[Math.floor(Math.random() * nouns.length)]);
        }
      }
    }

    // Capitalize first word and join
    const randomText = words.map((word, i) =>
      i === 0 ? word!.charAt(0).toUpperCase() + word!.slice(1) : word!
    ).join(' ');

    // Hash the random text to get MD5
    const hash = generateMD5(randomText);
    setInput(randomText);
    setOutput(hash);
  };

  return (
    <ToolLayout
      title="MD5 Hash"
      description="Generate MD5 hashes from text (for checksums, not security)"
    >
      <div className="space-y-4">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button label="Generate MD5 Hash" onClick={generateHash} variant="primary" />
          <Button label="Generate Random Hash" onClick={generateRandomHash} variant="secondary" />
          <Button label="Clear" onClick={clear} variant="secondary" />
        </div>

        {/* Info Note */}
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
          <p className="text-amber-800 text-sm">
            <strong>Note:</strong> MD5 is not cryptographically secure. Use for checksums, cache busting, or development only.
          </p>
        </div>

        {/* Side by Side Input/Output */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
            <div className="flex flex-col gap-2" aria-live="polite">
              <span className="text-sm font-medium text-slate-700">MD5 Hash</span>
              {output ? (
                <div className="space-y-3">
                  <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
                    <p className="font-mono text-lg text-slate-900 break-all">{output}</p>
                  </div>
                  <CopyButton text={output} label="Copy Hash" />
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-md p-4 h-full flex items-center justify-center">
                  <p className="text-slate-400">MD5 hash will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}

export default MD5Generator;
