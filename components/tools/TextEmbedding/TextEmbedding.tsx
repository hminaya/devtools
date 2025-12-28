'use client';

import { useState, useEffect, useRef } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import CodeDisplay from '../../shared/CodeDisplay';

interface SimilarityResult {
  text: string;
  similarity: number;
  index: number;
}

function TextEmbedding() {
  const [queryText, setQueryText] = useState('');
  const [candidateTexts, setCandidateTexts] = useState('');
  const [results, setResults] = useState<SimilarityResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [modelDownloading, setModelDownloading] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [error, setError] = useState('');
  const [showEmbeddings, setShowEmbeddings] = useState(false);
  const [embeddings, setEmbeddings] = useState<{ query?: number[]; candidates?: number[][] }>({});
  const extractorRef = useRef<any>(null);

  // Initialize AI model when component mounts
  useEffect(() => {
    if (!extractorRef.current && !modelReady) {
      setModelDownloading(true);

      import('@xenova/transformers').then(async ({ pipeline, env }) => {
        try {
          // Configure for browser environment
          env.allowLocalModels = false;
          env.allowRemoteModels = true;

          // Initialize feature extraction pipeline
          const extractor = await pipeline(
            'feature-extraction',
            'Xenova/all-MiniLM-L6-v2'
          );

          extractorRef.current = extractor;
          setModelReady(true);
        } catch (error) {
          console.error('Failed to load AI model:', error);
          setError('Failed to load AI model. Please refresh the page and try again.');
        } finally {
          setModelDownloading(false);
        }
      }).catch((error) => {
        console.error('Failed to import transformers:', error);
        setError('Failed to load transformers library. Please refresh the page.');
        setModelDownloading(false);
      });
    }
  }, [modelReady]);

  // Calculate cosine similarity between two vectors
  const cosineSimilarity = (a: number[], b: number[]): number => {
    const dotProduct = a.reduce((sum, val, i) => sum + val * (b[i] ?? 0), 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  };

  // Convert tensor output to array
  const tensorToArray = (tensor: any): number[] => {
    if (tensor.data) {
      return Array.from(tensor.data);
    }
    return tensor;
  };

  const computeSimilarity = async () => {
    if (!queryText.trim()) {
      setError('Please enter a query text');
      return;
    }

    if (!candidateTexts.trim()) {
      setError('Please enter at least one candidate text');
      return;
    }

    if (!extractorRef.current) {
      setError('AI model is still loading. Please wait and try again.');
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);
    setEmbeddings({});

    try {
      // Parse candidate texts (one per line, filter empty lines)
      const candidates = candidateTexts
        .split('\n')
        .map(c => c.trim())
        .filter(c => c.length > 0);

      if (candidates.length === 0) {
        setError('Please enter at least one valid candidate text');
        setLoading(false);
        return;
      }

      // Generate embedding for query
      const queryOutput = await extractorRef.current(queryText, {
        pooling: 'mean',
        normalize: true,
      });
      const queryEmbedding = tensorToArray(queryOutput);

      // Generate embeddings for all candidates
      const candidateEmbeddings: number[][] = [];
      for (const candidate of candidates) {
        const output = await extractorRef.current(candidate, {
          pooling: 'mean',
          normalize: true,
        });
        candidateEmbeddings.push(tensorToArray(output));
      }

      // Calculate similarity scores
      const similarityResults: SimilarityResult[] = candidates.map((text, index) => {
        const candidateEmbedding = candidateEmbeddings[index];
        if (!candidateEmbedding) {
          throw new Error(`Missing embedding for candidate ${index}`);
        }
        return {
          text,
          similarity: cosineSimilarity(queryEmbedding, candidateEmbedding),
          index,
        };
      });

      // Sort by similarity (highest first)
      similarityResults.sort((a, b) => b.similarity - a.similarity);

      setResults(similarityResults);
      setEmbeddings({
        query: queryEmbedding,
        candidates: candidateEmbeddings,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compute similarity');
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setQueryText('');
    setCandidateTexts('');
    setResults([]);
    setError('');
    setEmbeddings({});
    setShowEmbeddings(false);
  };

  const loadSample = (type: 'duplicate-detection' | 'semantic-search' | 'bug-reports') => {
    const samples = {
      'duplicate-detection': {
        query: "How do I reset my password?",
        candidates: `How can I change my password?
I forgot my login credentials
What's the process for password recovery?
How to update billing information
Need help accessing my account
Where can I find the settings menu?`,
      },
      'semantic-search': {
        query: "machine learning algorithms",
        candidates: `Artificial intelligence and neural networks
Best practices for web development
Deep learning models for image classification
How to cook the perfect pasta
Linear regression and decision trees
Travel tips for Europe`,
      },
      'bug-reports': {
        query: "Application crashes when uploading large files",
        candidates: `App freezes during file upload process
Cannot upload images bigger than 5MB
System becomes unresponsive with large attachments
Login page doesn't load properly
File upload succeeds but app stops working
Dark mode toggle not working`,
      },
    };

    const sample = samples[type];
    setQueryText(sample.query);
    setCandidateTexts(sample.candidates);
    setResults([]);
    setError('');
    setEmbeddings({});
  };

  const getSimilarityColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-50 border-green-200';
    if (score >= 0.6) return 'bg-blue-50 border-blue-200';
    if (score >= 0.4) return 'bg-yellow-50 border-yellow-200';
    return 'bg-gray-50 border-gray-200';
  };

  const getSimilarityTextColor = (score: number) => {
    if (score >= 0.8) return 'text-green-700';
    if (score >= 0.6) return 'text-blue-700';
    if (score >= 0.4) return 'text-yellow-700';
    return 'text-gray-700';
  };

  const getSimilarityLabel = (score: number) => {
    if (score >= 0.8) return 'Very Similar';
    if (score >= 0.6) return 'Similar';
    if (score >= 0.4) return 'Somewhat Similar';
    return 'Not Similar';
  };

  return (
    <ToolLayout
      title="Text Embedding & Similarity"
      description="Generate embeddings and find semantic similarity between texts using AI"
      fullWidth
    >
      <div className="space-y-6">
        {/* Model Status */}
        {modelDownloading && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
            <p className="text-amber-800 text-sm">
              ⏳ Downloading AI model (~23MB)... This is very fast!
            </p>
          </div>
        )}

        {modelReady && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-green-800 text-sm">
              ✅ AI model ready (Xenova/all-MiniLM-L6-v2)
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-blue-800 text-sm">
            <strong>What is Semantic Similarity?</strong> This AI tool converts text into numerical vectors (embeddings)
            that capture semantic meaning. It then compares how similar texts are based on their meaning, not just keywords.
            Perfect for finding duplicate content, similar bug reports, semantic search, or grouping related documents!
          </p>
        </div>

        {/* Input Section */}
        <div className="space-y-4">
          <TextArea
            value={queryText}
            onChange={setQueryText}
            label="Query Text (the text you want to find matches for)"
            placeholder="Enter your query text... (e.g., 'How do I reset my password?')"
            rows={3}
          />

          <TextArea
            value={candidateTexts}
            onChange={setCandidateTexts}
            label="Candidate Texts (one per line)"
            placeholder="Enter candidate texts, one per line...&#10;How can I change my password?&#10;I forgot my login credentials&#10;What's the process for password recovery?"
            rows={8}
          />

          <div className="flex gap-3 flex-wrap">
            <Button
              label={loading ? 'Computing...' : modelDownloading ? 'Loading model...' : 'Compute Similarity'}
              onClick={computeSimilarity}
              variant="primary"
              disabled={loading || !modelReady}
            />
            <Button label="Duplicate Detection Sample" onClick={() => loadSample('duplicate-detection')} variant="secondary" />
            <Button label="Semantic Search Sample" onClick={() => loadSample('semantic-search')} variant="secondary" />
            <Button label="Bug Reports Sample" onClick={() => loadSample('bug-reports')} variant="secondary" />
            <Button label="Clear" onClick={clear} variant="secondary" />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700 font-medium">Error:</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            {/* Query Display */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm font-medium text-purple-700 mb-2">Query Text:</p>
              <p className="text-purple-900 font-medium">{queryText}</p>
            </div>

            {/* Similarity Results */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Similarity Results (sorted by relevance)
              </h3>
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`${getSimilarityColor(result.similarity)} border rounded-lg p-4`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-slate-500">
                            #{index + 1}
                          </span>
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${
                            result.similarity >= 0.8 ? 'bg-green-100 text-green-700' :
                            result.similarity >= 0.6 ? 'bg-blue-100 text-blue-700' :
                            result.similarity >= 0.4 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {getSimilarityLabel(result.similarity)}
                          </span>
                        </div>
                        <p className="text-slate-900">{result.text}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${getSimilarityTextColor(result.similarity)}`}>
                          {(result.similarity * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          result.similarity >= 0.8 ? 'bg-green-600' :
                          result.similarity >= 0.6 ? 'bg-blue-600' :
                          result.similarity >= 0.4 ? 'bg-yellow-600' :
                          'bg-gray-600'
                        }`}
                        style={{ width: `${result.similarity * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Show Embeddings Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="show-embeddings"
                checked={showEmbeddings}
                onChange={(e) => setShowEmbeddings(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="show-embeddings" className="text-sm text-slate-700">
                Show embedding vectors (advanced)
              </label>
            </div>

            {/* Embeddings Display */}
            {showEmbeddings && embeddings.query && (
              <div>
                <CodeDisplay
                  code={JSON.stringify({
                    query_embedding: embeddings.query.slice(0, 10).map(n => n.toFixed(6)) + '... (384 dimensions total)',
                    embedding_dimension: embeddings.query.length,
                    note: 'Embeddings are 384-dimensional vectors representing semantic meaning',
                  }, null, 2)}
                  language="json"
                  label="Embedding Information"
                />
              </div>
            )}

            {/* Raw JSON Results */}
            <div>
              <CodeDisplay
                code={JSON.stringify({
                  query: queryText,
                  results: results.map(r => ({
                    text: r.text,
                    similarity_score: r.similarity,
                    similarity_percentage: `${(r.similarity * 100).toFixed(1)}%`,
                  })),
                  model: 'Xenova/all-MiniLM-L6-v2',
                }, null, 2)}
                language="json"
                label="Raw JSON Results"
              />
            </div>

            {/* Copy Results */}
            <div className="flex justify-end">
              <CopyButton
                text={JSON.stringify({
                  query: queryText,
                  results: results.map(r => ({
                    text: r.text,
                    similarity_score: r.similarity,
                    similarity_percentage: `${(r.similarity * 100).toFixed(1)}%`,
                  })),
                  model: 'Xenova/all-MiniLM-L6-v2',
                }, null, 2)}
                label="Copy Results as JSON"
              />
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export default TextEmbedding;
