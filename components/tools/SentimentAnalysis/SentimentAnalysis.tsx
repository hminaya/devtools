'use client';

import { useState, useEffect, useRef } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import CodeDisplay from '../../shared/CodeDisplay';
import { analyzeSentiment, type AnalysisMethod, type SentimentResult } from '../../../utils/sentimentAnalysis';

function SentimentAnalysis() {
  const [input, setInput] = useState('');
  const [method, setMethod] = useState<AnalysisMethod>('lexicon');
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [modelDownloading, setModelDownloading] = useState(false);
  const [aiModelReady, setAiModelReady] = useState(false);
  const classifierRef = useRef<any>(null);

  // Initialize AI model when component mounts (only if needed)
  useEffect(() => {
    if (method === 'transformers' && !classifierRef.current && !aiModelReady) {
      setModelDownloading(true);

      import('@xenova/transformers').then(async ({ pipeline, env }) => {
        try {
          // Configure for browser environment
          env.allowLocalModels = false;
          env.allowRemoteModels = true;

          // Initialize pipeline
          const classifier = await pipeline(
            'sentiment-analysis',
            'Xenova/distilbert-base-uncased-finetuned-sst-2-english'
          );

          classifierRef.current = classifier;
          setAiModelReady(true);
        } catch (error) {
          console.error('Failed to load AI model:', error);
        } finally {
          setModelDownloading(false);
        }
      }).catch((error) => {
        console.error('Failed to import transformers:', error);
        setModelDownloading(false);
      });
    }
  }, [method, aiModelReady]);

  const analyze = async () => {
    if (!input.trim()) {
      setResult({ success: false, error: 'Please enter some text to analyze' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      if (method === 'transformers') {
        // Use AI model
        if (!classifierRef.current) {
          setResult({
            success: false,
            error: 'AI model is still loading. Please wait and try again.',
          });
          setLoading(false);
          return;
        }

        try {
          const result = await classifierRef.current(input);

          if (!result || !Array.isArray(result) || result.length === 0) {
            throw new Error('Invalid response from AI model');
          }

          const prediction = result[0] as { label: string; score: number };

          // Extract positive/negative words for display
          const POSITIVE_WORDS = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'awesome', 'love', 'happy', 'joy', 'perfect', 'best'];
          const NEGATIVE_WORDS = ['bad', 'terrible', 'awful', 'horrible', 'poor', 'worst', 'hate', 'sad', 'angry', 'disappointed'];

          const words = input.toLowerCase().split(/\s+/);
          const positive: string[] = [];
          const negative: string[] = [];

          words.forEach(word => {
            const cleanWord = word.replace(/[^\w]/g, '');
            if (POSITIVE_WORDS.includes(cleanWord)) positive.push(cleanWord);
            else if (NEGATIVE_WORDS.includes(cleanWord)) negative.push(cleanWord);
          });

          setResult({
            success: true,
            label: prediction.label as 'POSITIVE' | 'NEGATIVE',
            score: prediction.score,
            positive,
            negative,
          });
        } catch (aiError) {
          setResult({
            success: false,
            error: aiError instanceof Error ? aiError.message : 'Failed to analyze with AI model',
          });
        }
      } else {
        // Use lexicon-based analysis
        const sentimentResult = await analyzeSentiment(input, method);
        setResult(sentimentResult);
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze sentiment',
      });
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setInput('');
    setResult(null);
  };

  const loadSample = (type: 'positive' | 'negative' | 'neutral') => {
    const samples = {
      positive: "I absolutely love this product! It's amazing and exceeded all my expectations. The quality is excellent and I'm so happy with my purchase. Highly recommend!",
      negative: "This is terrible. Worst experience ever, completely disappointed. The quality is awful and I regret buying this. Would not recommend to anyone.",
      neutral: "The package arrived on Tuesday. It contains a blue item made of plastic. The dimensions are as specified in the description. Shipping took 5 days.",
    };

    setInput(samples[type]);
    setResult(null);
  };

  const getSentimentEmoji = (label?: string) => {
    if (label === 'POSITIVE') return '😊';
    if (label === 'NEGATIVE') return '😞';
    return '😐';
  };

  const getSentimentColor = (label?: string) => {
    if (label === 'POSITIVE') return 'bg-green-50 border-green-200';
    if (label === 'NEGATIVE') return 'bg-red-50 border-red-200';
    return 'bg-gray-50 border-gray-200';
  };

  const getSentimentTextColor = (label?: string) => {
    if (label === 'POSITIVE') return 'text-green-700';
    if (label === 'NEGATIVE') return 'text-red-700';
    return 'text-gray-700';
  };

  return (
    <ToolLayout
      title="Sentiment Analysis"
      description="Analyze the emotional tone of text using lexicon-based or AI-powered methods"
      fullWidth
    >
      <div className="space-y-6">
        {/* Method Selection */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <label className="text-sm font-medium text-slate-700">
            Analysis Method:
          </label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as AnalysisMethod)}
            className="px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="lexicon">Fast Mode (Lexicon-Based)</option>
            <option value="transformers">AI Mode (Xenova/distilbert-base-uncased-finetuned-sst-2-english)</option>
          </select>

          {method === 'transformers' && !aiModelReady && (
            <div className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-md border border-amber-200">
              {modelDownloading ? '⏳ Downloading AI model (~67MB)...' : '⚠️ First use: Downloads ~67MB AI model'}
            </div>
          )}

          {method === 'transformers' && aiModelReady && (
            <div className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-md border border-green-200">
              ✅ AI model ready
            </div>
          )}
        </div>

        {/* Input Section */}
        <div className="space-y-4">
          <TextArea
            value={input}
            onChange={setInput}
            label="Text to Analyze"
            placeholder="Enter text to analyze sentiment... (e.g., product reviews, feedback, social media posts)"
            rows={8}
          />

          <div className="flex gap-3 flex-wrap">
            <Button
              label={loading ? 'Analyzing...' : method === 'transformers' && modelDownloading ? 'Loading AI model...' : 'Analyze Sentiment'}
              onClick={analyze}
              variant="primary"
              disabled={loading || (method === 'transformers' && !aiModelReady)}
            />
            <Button label="Positive Sample" onClick={() => loadSample('positive')} variant="secondary" />
            <Button label="Negative Sample" onClick={() => loadSample('negative')} variant="secondary" />
            <Button label="Neutral Sample" onClick={() => loadSample('neutral')} variant="secondary" />
            <Button label="Clear" onClick={clear} variant="secondary" />
          </div>
        </div>

        {/* Info about methods */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-blue-800 text-sm">
            <strong>Fast Mode:</strong> Instant results using a sentiment word dictionary. Great for quick analysis.
            <br />
            <strong>AI Mode:</strong> Uses a fine-tuned BERT model for more accurate, context-aware sentiment detection. Downloads a 67MB model on first use (cached afterward).
          </p>
        </div>

        {/* Error Message */}
        {result && !result.success && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700 font-medium">Error:</p>
            <p className="text-red-600 text-sm">{result.error}</p>
          </div>
        )}

        {/* Results */}
        {result && result.success && result.label && (
          <div className="space-y-4">
            {/* Main Result Card */}
            <div className={`${getSentimentColor(result.label)} border rounded-lg p-6`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="text-6xl">{getSentimentEmoji(result.label)}</div>
                  <div>
                    <h3 className={`text-2xl font-bold ${getSentimentTextColor(result.label)}`}>
                      {result.label}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Confidence: {((result.score || 0) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {result.comparative !== undefined && (
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-700">Score</p>
                    <p className="text-xl font-bold text-slate-900">
                      {result.comparative > 0 ? '+' : ''}{result.comparative.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>

              {/* Word Breakdown */}
              {(result.positive && result.positive.length > 0) || (result.negative && result.negative.length > 0) ? (
                <div className="space-y-2">
                  {result.positive && result.positive.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-green-700 mb-1">
                        Positive words detected:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {result.positive.map((word, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-mono"
                          >
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.negative && result.negative.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-red-700 mb-1">
                        Negative words detected:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {result.negative.map((word, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm font-mono"
                          >
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Raw JSON Results */}
            <div>
              <CodeDisplay
                code={JSON.stringify({
                  text: input,
                  sentiment: result.label,
                  confidence: result.score,
                  score: result.comparative,
                  method,
                }, null, 2)}
                language="json"
                label="Raw JSON Results"
              />
            </div>

            {/* Copy Results */}
            <div className="flex justify-end">
              <CopyButton
                text={JSON.stringify({
                  text: input,
                  sentiment: result.label,
                  confidence: result.score,
                  score: result.comparative,
                  method,
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

export default SentimentAnalysis;
