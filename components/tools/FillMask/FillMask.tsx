'use client';

import { useState, useEffect, useRef } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import CodeDisplay from '../../shared/CodeDisplay';

interface Prediction {
  token: string;
  token_str: string;
  score: number;
  sequence: string;
}

type ModelOption = {
  value: string;
  label: string;
  size: string;
  description: string;
};

const MODELS: ModelOption[] = [
  {
    value: 'Xenova/distilbert-base-uncased',
    label: 'DistilBERT Base (Default)',
    size: '~66MB',
    description: 'Smallest, fastest, best for general use',
  },
  {
    value: 'Xenova/bert-base-uncased',
    label: 'BERT Base',
    size: '~110MB',
    description: 'More accurate, slightly slower',
  },
  {
    value: 'Xenova/albert-base-v2',
    label: 'ALBERT Base',
    size: '~45MB',
    description: 'Lightest, good for simple completions',
  },
];

function FillMask() {
  const [inputText, setInputText] = useState('');
  const [selectedModel, setSelectedModel] = useState(MODELS[0]?.value || 'Xenova/distilbert-base-uncased');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [modelDownloading, setModelDownloading] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [error, setError] = useState('');
  const unmaskerRef = useRef<any>(null);

  // Initialize AI model when component mounts or model changes
  useEffect(() => {
    // Reset state when model changes
    unmaskerRef.current = null;
    setModelReady(false);
    setModelDownloading(true);
    setError('');

    import('@huggingface/transformers').then(async ({ pipeline, env }) => {
      try {
        // Configure for browser environment
        env.allowLocalModels = false;
        env.allowRemoteModels = true;

        // Initialize fill-mask pipeline
        const unmasker = await pipeline(
          'fill-mask',
          selectedModel
        );

        unmaskerRef.current = unmasker;
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
  }, [selectedModel]);

  const predictMask = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text with [MASK]');
      return;
    }

    if (!inputText.includes('[MASK]')) {
      setError('Please include [MASK] in your text where you want predictions');
      return;
    }

    if (!unmaskerRef.current) {
      setError('AI model is still loading. Please wait and try again.');
      return;
    }

    setLoading(true);
    setError('');
    setPredictions([]);

    try {
      // Perform fill-mask prediction
      const result = await unmaskerRef.current(inputText);

      if (!result || !Array.isArray(result)) {
        throw new Error('Invalid response from model');
      }

      setPredictions(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to predict masked text');
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setInputText('');
    setPredictions([]);
    setError('');
  };

  const loadSample = (type: 'simple' | 'technical' | 'creative') => {
    const samples = {
      simple: 'The weather today is [MASK] and sunny.',
      technical: 'To install the package, run npm [MASK] package-name in your terminal.',
      creative: 'Once upon a time, there was a [MASK] dragon who lived in the mountains.',
    };

    setInputText(samples[type]);
    setPredictions([]);
    setError('');
  };

  const insertMask = () => {
    setInputText(prev => prev + '[MASK]');
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.5) return 'bg-green-50 border-green-200';
    if (score >= 0.2) return 'bg-blue-50 border-blue-200';
    if (score >= 0.1) return 'bg-yellow-50 border-yellow-200';
    return 'bg-gray-50 border-gray-200';
  };

  const getConfidenceTextColor = (score: number) => {
    if (score >= 0.5) return 'text-green-700';
    if (score >= 0.2) return 'text-blue-700';
    if (score >= 0.1) return 'text-yellow-700';
    return 'text-gray-700';
  };

  return (
    <ToolLayout
      title="Fill-Mask Text Completion"
      description="Complete sentences and predict missing words using AI"
      fullWidth
    >
      <div className="space-y-6">
        {/* Model Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <span>AI Model</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {MODELS.map((model) => (
                <option key={model.value} value={model.value}>
                  {model.label} - {model.size} - {model.description}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Model Status */}
        {modelDownloading && (
          <div role="status" className="bg-amber-50 border border-amber-200 rounded-md p-4">
            <p className="text-amber-800 text-sm">
              ⏳ Downloading AI model ({MODELS.find(m => m.value === selectedModel)?.size})... This may take a moment on first use.
            </p>
          </div>
        )}

        {modelReady && (
          <div role="status" className="bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-green-800 text-sm">
              ✅ AI model ready ({selectedModel})
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-blue-800 text-sm">
            <strong>What is Fill-Mask?</strong> This AI tool predicts the most likely words to fill in blanks in your text.
            Just type your sentence and use <code className="bg-blue-100 px-1 rounded">[MASK]</code> where you want predictions.
            The AI will suggest multiple possibilities with confidence scores. Perfect for completing sentences, fixing typos,
            or getting word suggestions in context!
          </p>
        </div>

        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <span>Text with [MASK]
            </span>
            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter your text with [MASK] where you want predictions...&#10;Example: The quick brown [MASK] jumps over the lazy dog."
                rows={4}
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>
            </label>
            <button
              onClick={insertMask}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              + Insert [MASK] at cursor
            </button>
          </div>

          <div className="flex gap-3 flex-wrap">
            <Button
              label={loading ? 'Predicting...' : modelDownloading ? 'Loading model...' : 'Predict Mask'}
              onClick={predictMask}
              variant="primary"
              disabled={loading || !modelReady}
            />
            <Button label="Simple Sample" onClick={() => loadSample('simple')} variant="secondary" />
            <Button label="Technical Sample" onClick={() => loadSample('technical')} variant="secondary" />
            <Button label="Creative Sample" onClick={() => loadSample('creative')} variant="secondary" />
            <Button label="Clear" onClick={clear} variant="secondary" />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div role="alert" className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700 font-medium">Error:</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Results */}
        {predictions.length > 0 && (
          <div className="space-y-4">
            {/* Input Text Display */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm font-medium text-purple-700 mb-2">Your Input:</p>
              <p className="text-purple-900 font-mono text-sm">{inputText}</p>
            </div>

            {/* Predictions */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Top {predictions.length} Predictions
              </h3>
              <div className="space-y-3">
                {predictions.map((pred, index) => (
                  <div
                    key={index}
                    className={`${getConfidenceColor(pred.score)} border rounded-lg p-4`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-slate-500">
                            #{index + 1}
                          </span>
                          <span className="text-lg font-bold text-slate-900 font-mono">
                            {pred.token_str}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">
                          Complete sentence: <span className="font-mono">{pred.sequence}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${getConfidenceTextColor(pred.score)}`}>
                          {(pred.score * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          pred.score >= 0.5 ? 'bg-green-600' :
                          pred.score >= 0.2 ? 'bg-blue-600' :
                          pred.score >= 0.1 ? 'bg-yellow-600' :
                          'bg-gray-600'
                        }`}
                        style={{ width: `${pred.score * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Raw JSON Results */}
            <div>
              <CodeDisplay
                code={JSON.stringify({
                  input: inputText,
                  predictions: predictions.map(p => ({
                    word: p.token_str,
                    confidence: p.score,
                    confidence_percentage: `${(p.score * 100).toFixed(1)}%`,
                    complete_sentence: p.sequence,
                  })),
                  model: selectedModel,
                }, null, 2)}
                language="json"
                label="Raw JSON Results"
              />
            </div>

            {/* Copy Results */}
            <div className="flex justify-end">
              <CopyButton
                text={JSON.stringify({
                  input: inputText,
                  predictions: predictions.map(p => ({
                    word: p.token_str,
                    confidence: p.score,
                    confidence_percentage: `${(p.score * 100).toFixed(1)}%`,
                    complete_sentence: p.sequence,
                  })),
                  model: selectedModel,
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

export default FillMask;
