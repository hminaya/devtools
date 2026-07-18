'use client';

import { useMemo, useState } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import CodeDisplay from '../../shared/CodeDisplay';
import { tokenizeText, getAvailableTokenizers, type TokenizerType } from '../../../utils/tokenizer';

type SizeMode = 'token' | 'character';
type ChunkMode = 'fixed' | 'sentence' | 'paragraph' | 'hybrid';

type ChunkData = {
  index: number;
  text: string;
  tokenCount: number;
  charCount: number;
};

const DEFAULT_SIZE_MODE: SizeMode = 'token';
const DEFAULT_CHUNK_MODE: ChunkMode = 'hybrid';
const DEFAULT_CHUNK_SIZE = 350;
const DEFAULT_OVERLAP = 50;
const DEFAULT_TOKENIZER: TokenizerType = 'gpt-tokenizer-gpt4';
const MAX_RECOMMENDED_INPUT = 200000;

const splitIntoSentences = (text: string): string[] => {
  const parts = text.split(/([.!?]+\s+)/);
  const sentences: string[] = [];

  for (let index = 0; index < parts.length; index += 2) {
    const sentence = parts[index] || '';
    const punctuation = parts[index + 1] || '';
    const combined = `${sentence}${punctuation}`;

    if (combined.trim().length > 0) {
      sentences.push(combined);
    }
  }

  return sentences.length > 0 ? sentences : text ? [text] : [];
};

const splitIntoParagraphs = (text: string): string[] => {
  const parts = text.split(/(\n\s*\n+)/);
  const paragraphs: string[] = [];

  for (let index = 0; index < parts.length; index += 2) {
    const paragraph = parts[index] || '';
    const separator = parts[index + 1] || '';
    const combined = `${paragraph}${separator}`;

    if (combined.trim().length > 0) {
      paragraphs.push(combined);
    }
  }

  return paragraphs.length > 0 ? paragraphs : text ? [text] : [];
};

const splitTextByCharacters = (text: string, size: number): string[] => {
  const chunks: string[] = [];

  for (let index = 0; index < text.length; index += size) {
    chunks.push(text.slice(index, index + size));
  }

  return chunks;
};

const splitTextByTokens = async (
  text: string,
  size: number,
  tokenizerType: TokenizerType
): Promise<string[]> => {
  const tokenization = await tokenizeText(text, tokenizerType);

  if (!tokenization.success || !tokenization.decodedTokens) {
    throw new Error(tokenization.error || 'Failed to tokenize text');
  }

  const chunks: string[] = [];
  const tokens = tokenization.decodedTokens;

  for (let index = 0; index < tokens.length; index += size) {
    const slice = tokens.slice(index, index + size);
    if (slice.length > 0) {
      chunks.push(slice.join(''));
    }
  }

  return chunks;
};

const getTextSize = async (
  text: string,
  sizeMode: SizeMode,
  tokenizerType: TokenizerType
): Promise<number> => {
  if (sizeMode === 'character') {
    return text.length;
  }

  const tokenization = await tokenizeText(text, tokenizerType);

  if (!tokenization.success || typeof tokenization.tokenCount !== 'number') {
    throw new Error(tokenization.error || 'Failed to tokenize text');
  }

  return tokenization.tokenCount;
};

const getOverlapText = async (
  text: string,
  overlap: number,
  sizeMode: SizeMode,
  tokenizerType: TokenizerType
): Promise<string> => {
  if (overlap <= 0 || text.length === 0) {
    return '';
  }

  if (sizeMode === 'character') {
    return text.slice(-overlap);
  }

  const tokenization = await tokenizeText(text, tokenizerType);

  if (!tokenization.success || !tokenization.decodedTokens) {
    return '';
  }

  return tokenization.decodedTokens.slice(-overlap).join('');
};

const chunkTextFixed = async (
  text: string,
  size: number,
  overlap: number,
  sizeMode: SizeMode,
  tokenizerType: TokenizerType
): Promise<string[]> => {
  if (sizeMode === 'character') {
    const step = size - overlap;
    const chunks: string[] = [];

    for (let index = 0; index < text.length; index += step) {
      chunks.push(text.slice(index, index + size));
    }

    return chunks;
  }

  const tokenization = await tokenizeText(text, tokenizerType);

  if (!tokenization.success || !tokenization.decodedTokens) {
    throw new Error(tokenization.error || 'Failed to tokenize text');
  }

  const step = size - overlap;
  const chunks: string[] = [];
  const tokens = tokenization.decodedTokens;

  for (let index = 0; index < tokens.length; index += step) {
    const slice = tokens.slice(index, index + size);
    if (slice.length > 0) {
      chunks.push(slice.join(''));
    }
  }

  return chunks;
};

const chunkTextByUnits = async (
  units: string[],
  size: number,
  overlap: number,
  sizeMode: SizeMode,
  tokenizerType: TokenizerType
): Promise<string[]> => {
  const chunks: string[] = [];
  let currentText = '';
  let currentSize = 0;

  for (const unit of units) {
    const unitSize = await getTextSize(unit, sizeMode, tokenizerType);

    if (currentText && currentSize + unitSize > size) {
      chunks.push(currentText);
      const overlapText = await getOverlapText(currentText, overlap, sizeMode, tokenizerType);
      currentText = overlapText;
      currentSize = overlapText ? await getTextSize(overlapText, sizeMode, tokenizerType) : 0;
    }

    currentText += unit;
    currentSize += unitSize;
  }

  if (currentText.trim().length > 0) {
    chunks.push(currentText);
  }

  return chunks;
};

const buildUnits = async (
  text: string,
  chunkMode: ChunkMode,
  size: number,
  sizeMode: SizeMode,
  tokenizerType: TokenizerType
): Promise<string[]> => {
  if (chunkMode === 'fixed') {
    return [];
  }

  const baseUnits = chunkMode === 'sentence' ? splitIntoSentences(text) : splitIntoParagraphs(text);
  const units: string[] = [];

  for (const unit of baseUnits) {
    const unitSize = await getTextSize(unit, sizeMode, tokenizerType);

    if (unitSize <= size) {
      units.push(unit);
      continue;
    }

    if (chunkMode === 'sentence' || chunkMode === 'paragraph') {
      const splitUnits = sizeMode === 'character'
        ? splitTextByCharacters(unit, size)
        : await splitTextByTokens(unit, size, tokenizerType);
      units.push(...splitUnits);
      continue;
    }

    const sentences = splitIntoSentences(unit);
    for (const sentence of sentences) {
      const sentenceSize = await getTextSize(sentence, sizeMode, tokenizerType);
      if (sentenceSize <= size) {
        units.push(sentence);
      } else {
        const splitUnits = sizeMode === 'character'
          ? splitTextByCharacters(sentence, size)
          : await splitTextByTokens(sentence, size, tokenizerType);
        units.push(...splitUnits);
      }
    }
  }

  return units;
};

const buildChunkData = async (
  chunks: string[],
  tokenizerType: TokenizerType
): Promise<ChunkData[]> => {
  const results = await Promise.all(
    chunks.map(async (chunk, index) => {
      const tokenization = await tokenizeText(chunk, tokenizerType);

      if (!tokenization.success || typeof tokenization.tokenCount !== 'number') {
        throw new Error(tokenization.error || 'Failed to tokenize chunk');
      }

      return {
        index: index + 1,
        text: chunk,
        tokenCount: tokenization.tokenCount,
        charCount: chunk.length,
      };
    })
  );

  return results;
};

const formatCsvValue = (value: string) => {
  const escaped = value.replace(/"/g, '""');

  if (/[",\n]/.test(escaped)) {
    return `"${escaped}"`;
  }

  return escaped;
};

function RagChunker() {
  const [input, setInput] = useState('');
  const [sizeMode, setSizeMode] = useState<SizeMode>(DEFAULT_SIZE_MODE);
  const [chunkMode, setChunkMode] = useState<ChunkMode>(DEFAULT_CHUNK_MODE);
  const [chunkSize, setChunkSize] = useState(DEFAULT_CHUNK_SIZE);
  const [overlap, setOverlap] = useState(DEFAULT_OVERLAP);
  const [tokenizer, setTokenizer] = useState<TokenizerType>(DEFAULT_TOKENIZER);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [chunks, setChunks] = useState<ChunkData[]>([]);
  const [showReconstruction, setShowReconstruction] = useState(false);

  const tokenizers = useMemo(() => getAvailableTokenizers(), []);
  const inputTooLarge = input.length > MAX_RECOMMENDED_INPUT;

  const handleChunk = async () => {
    if (!input.trim()) {
      setError('Please enter text to chunk');
      setChunks([]);
      return;
    }

    if (chunkSize <= 0) {
      setError('Chunk size must be greater than 0');
      setChunks([]);
      return;
    }

    if (overlap < 0) {
      setError('Overlap cannot be negative');
      setChunks([]);
      return;
    }

    if (overlap >= chunkSize) {
      setError('Overlap must be smaller than chunk size');
      setChunks([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      let chunkTexts: string[] = [];

      if (chunkMode === 'fixed') {
        chunkTexts = await chunkTextFixed(input, chunkSize, overlap, sizeMode, tokenizer);
      } else {
        const units = await buildUnits(input, chunkMode, chunkSize, sizeMode, tokenizer);
        chunkTexts = await chunkTextByUnits(units, chunkSize, overlap, sizeMode, tokenizer);
      }

      const chunkData = await buildChunkData(chunkTexts, tokenizer);
      setChunks(chunkData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to chunk text');
      setChunks([]);
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setInput('');
    setChunks([]);
    setError('');
    setShowReconstruction(false);
  };

  const loadSample = () => {
    const sample = `## Getting Started with Retrieval-Augmented Generation

Retrieval-augmented generation (RAG) combines external knowledge sources with large language models. By retrieving relevant context and supplying it to the model, you can improve accuracy and reduce hallucinations.

### Why Chunking Matters
Chunking text into smaller, semantically coherent pieces helps search systems return the most relevant passages. The ideal chunk size depends on your model, the complexity of the content, and the retrieval strategy.

### Best Practices
- Keep chunks focused on a single idea.
- Add overlap to preserve context across boundaries.
- Preserve headings and paragraph breaks when possible.

### Example Use Cases
1. Internal knowledge bases
2. Product documentation
3. Legal and compliance searches
4. Customer support archives
`;

    setInput(sample);
    setChunks([]);
    setError('');
  };

  const totalTokens = chunks.reduce((sum, chunk) => sum + chunk.tokenCount, 0);
  const totalChars = chunks.reduce((sum, chunk) => sum + chunk.charCount, 0);

  const jsonOutput = JSON.stringify(
    chunks.map((chunk) => ({
      index: chunk.index,
      text: chunk.text,
      tokenCount: chunk.tokenCount,
      charCount: chunk.charCount,
    })),
    null,
    2
  );

  const jsonlOutput = chunks
    .map((chunk) =>
      JSON.stringify({
        index: chunk.index,
        text: chunk.text,
        tokenCount: chunk.tokenCount,
        charCount: chunk.charCount,
      })
    )
    .join('\n');

  const csvOutput = [
    'index,tokenCount,charCount,text',
    ...chunks.map((chunk) =>
      [
        chunk.index,
        chunk.tokenCount,
        chunk.charCount,
        formatCsvValue(chunk.text),
      ].join(',')
    ),
  ].join('\n');

  const plainTextOutput = chunks
    .map(
      (chunk) =>
        `--- Chunk ${chunk.index} (tokens: ${chunk.tokenCount}, chars: ${chunk.charCount}) ---\n${chunk.text}`
    )
    .join('\n\n');

  const reconstruction = chunks.map((chunk) => chunk.text).join('');

  return (
    <ToolLayout
      title="RAG Chunker"
      description="Split text into retrieval-friendly chunks with token-aware sizing and overlap."
      fullWidth
    >
      <div className="space-y-6">
        <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
          <p className="text-slate-700 text-sm">
            <strong>Defaults:</strong> Token-based sizing, 350 tokens per chunk, 50 token overlap, tokenizer
            gpt-tokenizer-gpt4. Max recommended input: 200k characters.
          </p>
        </div>

        <div className="space-y-4">
          <TextArea
            value={input}
            onChange={setInput}
            label="Source Text"
            placeholder="Paste your document or knowledge base content here..."
            rows={12}
          />

          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[220px]">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <span>Chunk sizing</span>
                <select
                  value={sizeMode}
                  onChange={(event) => setSizeMode(event.target.value as SizeMode)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="token">Token-based</option>
                  <option value="character">Character-based</option>
                </select>
              </label>
            </div>

            <div className="flex-1 min-w-[220px]">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <span>Chunking mode</span>
                <select
                  value={chunkMode}
                  onChange={(event) => setChunkMode(event.target.value as ChunkMode)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="fixed">Fixed size</option>
                  <option value="sentence">Sentence-aware</option>
                  <option value="paragraph">Paragraph-aware</option>
                  <option value="hybrid">Hybrid (paragraph → sentence → size)</option>
                </select>
              </label>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <span>Chunk size ({sizeMode === 'token' ? 'tokens' : 'characters'})</span>
                <input
                  type="number"
                  min={1}
                  value={chunkSize}
                  onChange={(event) => setChunkSize(Number(event.target.value))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <span>Overlap ({sizeMode === 'token' ? 'tokens' : 'characters'})</span>
                <input
                  type="number"
                  min={0}
                  value={overlap}
                  onChange={(event) => setOverlap(Number(event.target.value))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
            </div>

            <div className="flex-1 min-w-[240px]">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <span>Tokenizer (for token counts)</span>
                <select
                  value={tokenizer}
                  onChange={(event) => setTokenizer(event.target.value as TokenizerType)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {tokenizers.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <p className="text-xs text-slate-500 mt-1">
                {tokenizers.find((option) => option.value === tokenizer)?.description}
              </p>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <Button
              label={loading ? 'Chunking...' : 'Chunk Text'}
              onClick={handleChunk}
              variant="primary"
              disabled={loading}
            />
            <Button label="Load Sample" onClick={loadSample} variant="secondary" />
            <Button label="Clear" onClick={clear} variant="secondary" />
          </div>

          {inputTooLarge && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
              <p className="text-amber-800 text-sm">
                Input is {input.length.toLocaleString()} characters. Max recommended input is
                {` ${MAX_RECOMMENDED_INPUT.toLocaleString()}`} characters for performance.
              </p>
            </div>
          )}
        </div>

        {error && (
          <div role="alert" className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700 font-medium">Error:</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {chunks.length > 0 && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex flex-wrap gap-6">
                <div>
                  <p className="text-blue-900 font-semibold text-lg">{chunks.length} chunks</p>
                  <p className="text-blue-700 text-sm">{totalTokens} tokens total</p>
                </div>
                <div>
                  <p className="text-blue-900 font-semibold text-lg">{totalChars} characters</p>
                  <p className="text-blue-700 text-sm">Overlap included in totals</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-900">Chunk Preview</h3>
              <div className="space-y-3">
                {chunks.map((chunk) => (
                  <div key={chunk.index} className="border border-slate-200 rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-slate-700">
                        Chunk {chunk.index} · {chunk.tokenCount} tokens · {chunk.charCount} chars
                      </p>
                      <CopyButton text={chunk.text} label="Copy" />
                    </div>
                    <p className="text-slate-900 text-sm whitespace-pre-wrap">{chunk.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="reconstruction"
                  checked={showReconstruction}
                  onChange={(event) => setShowReconstruction(event.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="reconstruction" className="text-sm text-slate-700">
                  Show reconstruction preview (includes overlaps)
                </label>
              </div>

              {showReconstruction && (
                <CodeDisplay
                  code={reconstruction}
                  language="text"
                  label="Reconstructed Text"
                />
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Export Outputs</h3>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">JSON</label>
                  <CopyButton text={jsonOutput} label="Copy JSON" />
                </div>
                <CodeDisplay code={jsonOutput} language="json" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">JSONL</label>
                  <CopyButton text={jsonlOutput} label="Copy JSONL" />
                </div>
                <CodeDisplay code={jsonlOutput} language="text" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">CSV</label>
                  <CopyButton text={csvOutput} label="Copy CSV" />
                </div>
                <CodeDisplay code={csvOutput} language="text" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">Plain Text</label>
                  <CopyButton text={plainTextOutput} label="Copy Text" />
                </div>
                <CodeDisplay code={plainTextOutput} language="text" />
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export default RagChunker;
