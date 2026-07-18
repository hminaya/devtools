'use client';

import { useState } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import { tokenizeText, getAvailableTokenizers, type TokenizerType } from '../../../utils/tokenizer';
import type { TokenizationResult } from '../../../utils/tokenizer';

function JSTokenizer() {
  const [input, setInput] = useState('');
  const [selectedTokenizer, setSelectedTokenizer] = useState<TokenizerType>('tiktoken-gpt4');
  const [result, setResult] = useState<TokenizationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const tokenizers = getAvailableTokenizers();

  const handleTokenize = async () => {
    setLoading(true);
    const tokenizationResult = await tokenizeText(input, selectedTokenizer);
    setResult(tokenizationResult);
    setLoading(false);
  };

  const clear = () => {
    setInput('');
    setResult(null);
  };

  const generateSample = () => {
    const sample = `The quick brown fox jumps over the lazy dog. This is a sample text to demonstrate tokenization with AI language models. Tokenization breaks text into smaller units called tokens, which are the basic building blocks used by large language models like GPT-3 and GPT-4.`;
    setInput(sample);
    setResult(null);
  };

  return (
    <ToolLayout
      title="JS Tokenizers"
      description="Tokenize text using various AI tokenizers to see how language models process text"
      fullWidth
    >
      <div className="space-y-6">
        {/* Input Section */}
        <div className="space-y-4">
          <TextArea
            value={input}
            onChange={setInput}
            label="Input Text"
            placeholder="Enter text to tokenize..."
            rows={10}
          />

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <span>Select Tokenizer</span>
                <select
                  value={selectedTokenizer}
                  onChange={(e) => setSelectedTokenizer(e.target.value as TokenizerType)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {tokenizers.map((tokenizer) => (
                    <option key={tokenizer.value} value={tokenizer.value}>
                      {tokenizer.label}
                    </option>
                  ))}
                </select>
              </label>
              <p className="text-sm text-slate-500 mt-1">
                {tokenizers.find((t) => t.value === selectedTokenizer)?.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              label={loading ? 'Tokenizing...' : 'Tokenize'}
              onClick={handleTokenize}
              variant="primary"
              disabled={loading}
            />
            <Button label="Generate Sample" onClick={generateSample} variant="secondary" />
            <Button label="Clear" onClick={clear} variant="secondary" />
          </div>
        </div>

        {/* Error Message */}
        {result && !result.success && (
          <div role="alert" className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700 font-medium">Error:</p>
            <p className="text-red-600 text-sm">{result.error}</p>
          </div>
        )}

        {/* Results */}
        {result && result.success && (
          <div className="space-y-4">
            {/* Token Count */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-900 font-semibold text-lg">
                    Token Count: {result.tokenCount}
                  </p>
                  <p className="text-blue-700 text-sm">
                    {input.length} characters → {result.tokenCount} tokens
                  </p>
                </div>
                <div className="text-blue-600 text-3xl">🔢</div>
              </div>
            </div>

            {/* Token IDs */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-700">Token IDs</label>
                <CopyButton
                  text={result.tokens?.join(', ') || ''}
                  label="Copy Token IDs"
                />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-md p-4 max-h-48 overflow-auto">
                <div className="font-mono text-sm text-slate-900 break-words">
                  [{result.tokens?.join(', ')}]
                </div>
              </div>
            </div>

            {/* Decoded Tokens */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-700">
                  Token Breakdown ({result.decodedTokens?.length} tokens)
                </label>
                <CopyButton
                  text={JSON.stringify(
                    result.tokens?.map((id, i) => ({
                      id,
                      text: result.decodedTokens?.[i] || '',
                    })),
                    null,
                    2
                  )}
                  label="Copy as JSON"
                />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-md p-4 max-h-96 overflow-auto">
                <div className="space-y-2">
                  {result.tokens?.map((tokenId, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-2 bg-white rounded border border-slate-200 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex-shrink-0 w-16 text-right">
                        <span className="text-xs font-semibold text-blue-600">
                          #{index + 1}
                        </span>
                      </div>
                      <div className="flex-shrink-0 w-20">
                        <span className="text-sm font-mono text-slate-600">
                          ID: {tokenId}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-mono text-sm text-slate-900 break-all">
                          "{result.decodedTokens?.[index] || ''}"
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Info Note */}
            <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
              <p className="text-slate-700 text-sm">
                <strong>Note:</strong> Tokens are the basic units that language models use to
                process text. Each model uses a different tokenization strategy. Generally, 1
                token ≈ 4 characters or ≈ 0.75 words in English.
              </p>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export default JSTokenizer;
