'use client';

import { useState, useEffect, useRef } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import CodeDisplay from '../../shared/CodeDisplay';

interface ClassificationResult {
  label: string;
  score: number;
}

type ModelOption = {
  value: string;
  label: string;
  size: string;
  description: string;
};

const MODELS: ModelOption[] = [
  {
    value: 'Xenova/distilbert-base-uncased-mnli',
    label: 'DistilBERT Base (Default)',
    size: '~68MB',
    description: 'Balanced performance and speed',
  },
  {
    value: 'Xenova/nli-deberta-v3-xsmall',
    label: 'DeBERTa XSmall',
    size: '~25MB',
    description: 'Smallest, fastest option',
  },
  {
    value: 'Xenova/nli-deberta-v3-small',
    label: 'DeBERTa Small',
    size: '~55MB',
    description: 'Good balance of size and accuracy',
  },
];

function ZeroShotClassification() {
  const [inputText, setInputText] = useState('');
  const [categories, setCategories] = useState('');
  const [multiLabel, setMultiLabel] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODELS[0]?.value || 'Xenova/distilbert-base-uncased-mnli');
  const [results, setResults] = useState<ClassificationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [modelDownloading, setModelDownloading] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [error, setError] = useState('');
  const classifierRef = useRef<any>(null);

  // Initialize AI model when component mounts or model changes
  useEffect(() => {
    // Reset state when model changes
    classifierRef.current = null;
    setModelReady(false);
    setModelDownloading(true);
    setError('');

    import('@huggingface/transformers').then(async ({ pipeline, env }) => {
      try {
        // Configure for browser environment
        env.allowLocalModels = false;
        env.allowRemoteModels = true;

        // Initialize zero-shot classification pipeline
        const classifier = await pipeline(
          'zero-shot-classification',
          selectedModel
        );

        classifierRef.current = classifier;
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

  const classify = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to classify');
      return;
    }

    if (!categories.trim()) {
      setError('Please enter at least one category');
      return;
    }

    if (!classifierRef.current) {
      setError('AI model is still loading. Please wait and try again.');
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);

    try {
      // Parse categories (support comma-separated or newline-separated)
      const categoryList = categories
        .split(/[,\n]/)
        .map(c => c.trim())
        .filter(c => c.length > 0);

      if (categoryList.length === 0) {
        setError('Please enter at least one valid category');
        setLoading(false);
        return;
      }

      // Perform classification
      const result = await classifierRef.current(inputText, categoryList, {
        multi_label: multiLabel,
      });

      // Format results
      const formattedResults: ClassificationResult[] = result.labels.map((label: string, index: number) => ({
        label,
        score: result.scores[index],
      }));

      setResults(formattedResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to classify text');
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setInputText('');
    setCategories('');
    setResults([]);
    setError('');
  };

  const loadSample = (type: 'bug-report' | 'customer-feedback' | 'code-review') => {
    const samples = {
      'bug-report': {
        text: "The application crashes whenever I try to upload a file larger than 10MB. This happens consistently on both Chrome and Firefox. I'm running version 2.3.1 on macOS Ventura.",
        categories: 'bug, feature request, question, documentation, performance issue',
      },
      'customer-feedback': {
        text: "I absolutely love this product! The interface is intuitive and the customer support team was incredibly helpful when I had questions. Highly recommend!",
        categories: 'positive feedback, negative feedback, neutral feedback, feature request, support inquiry',
      },
      'code-review': {
        text: "This function has a potential security vulnerability. The user input is not properly sanitized before being used in the SQL query, which could lead to SQL injection attacks.",
        categories: 'security issue, performance optimization, code style, documentation needed, refactoring suggestion',
      },
    };

    const sample = samples[type];
    setInputText(sample.text);
    setCategories(sample.categories);
    setResults([]);
    setError('');
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.7) return 'bg-green-50 border-green-200';
    if (score >= 0.4) return 'bg-yellow-50 border-yellow-200';
    return 'bg-gray-50 border-gray-200';
  };

  const getConfidenceTextColor = (score: number) => {
    if (score >= 0.7) return 'text-green-700';
    if (score >= 0.4) return 'text-yellow-700';
    return 'text-gray-700';
  };

  return (
    <ToolLayout
      title="Zero-Shot Classification"
      description="Classify text into custom categories without training using AI"
      fullWidth
    >
      <div className="space-y-6">
        {/* Model Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            AI Model
          </label>
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
        </div>

        {/* Model Status */}
        {modelDownloading && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
            <p className="text-amber-800 text-sm">
              ⏳ Downloading AI model ({MODELS.find(m => m.value === selectedModel)?.size})... This may take a minute on first use.
            </p>
          </div>
        )}

        {modelReady && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-green-800 text-sm">
              ✅ AI model ready ({selectedModel})
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-blue-800 text-sm">
            <strong>What is Zero-Shot Classification?</strong> This AI tool can classify text into ANY categories you define,
            without any training. Just enter your text and your custom categories, and the model will determine which category
            best fits the text. Perfect for categorizing bug reports, support tickets, feedback, or any text data!
          </p>
        </div>

        {/* Input Section */}
        <div className="space-y-4">
          <TextArea
            value={inputText}
            onChange={setInputText}
            label="Text to Classify"
            placeholder="Enter the text you want to classify... (e.g., a bug report, customer feedback, support ticket)"
            rows={6}
          />

          <TextArea
            value={categories}
            onChange={setCategories}
            label="Categories (comma or newline separated)"
            placeholder="e.g., bug, feature request, question, documentation&#10;or: positive, negative, neutral"
            rows={3}
          />

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="multi-label"
              checked={multiLabel}
              onChange={(e) => setMultiLabel(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="multi-label" className="text-sm text-slate-700">
              Multi-label classification (text can belong to multiple categories)
            </label>
          </div>

          <div className="flex gap-3 flex-wrap">
            <Button
              label={loading ? 'Classifying...' : modelDownloading ? 'Loading model...' : 'Classify'}
              onClick={classify}
              variant="primary"
              disabled={loading || !modelReady}
            />
            <Button label="Bug Report Sample" onClick={() => loadSample('bug-report')} variant="secondary" />
            <Button label="Feedback Sample" onClick={() => loadSample('customer-feedback')} variant="secondary" />
            <Button label="Code Review Sample" onClick={() => loadSample('code-review')} variant="secondary" />
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
            {/* Classification Results */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Classification Results</h3>
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`${getConfidenceColor(result.score)} border rounded-lg p-4`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{result.label}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className={`text-sm font-medium ${getConfidenceTextColor(result.score)}`}>
                          Confidence: {(result.score * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${result.score * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Raw JSON Results */}
            <div>
              <CodeDisplay
                code={JSON.stringify({
                  text: inputText,
                  categories: categories.split(/[,\n]/).map(c => c.trim()).filter(c => c.length > 0),
                  multi_label: multiLabel,
                  results: results,
                }, null, 2)}
                language="json"
                label="Raw JSON Results"
              />
            </div>

            {/* Copy Results */}
            <div className="flex justify-end">
              <CopyButton
                text={JSON.stringify({
                  text: inputText,
                  categories: categories.split(/[,\n]/).map(c => c.trim()).filter(c => c.length > 0),
                  multi_label: multiLabel,
                  results: results,
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

export default ZeroShotClassification;
