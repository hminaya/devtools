'use client';

import { useState, useEffect, useRef } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import CodeDisplay from '../../shared/CodeDisplay';

type ModelOption = {
  value: string;
  label: string;
  size: string;
  description: string;
};

const MODELS: ModelOption[] = [
  {
    value: 'Xenova/distilbart-cnn-6-6',
    label: 'DistilBART 6-6 (Recommended)',
    size: '~283MB',
    description: 'Fast, good quality, best balance'
  },
  {
    value: 'Xenova/distilbart-cnn-12-6',
    label: 'DistilBART 12-6 (Better Quality)',
    size: '~358MB',
    description: 'More accurate summaries, slightly larger'
  },
];

function TextSummarization() {
  const [inputText, setInputText] = useState('');
  const [selectedModel, setSelectedModel] = useState(MODELS[0]?.value || 'Xenova/distilbart-cnn-6-6');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [modelDownloading, setModelDownloading] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker(
        new URL('./summarization.worker.ts', import.meta.url)
      );

      const onMessage = (e: MessageEvent) => {
        console.log('Worker message:', e.data);

        const { status, output, progress, error: workerError } = e.data;

        switch (status) {
          case 'initiate':
            setModelDownloading(true);
            setModelReady(false);
            break;

          case 'progress':
            if (progress !== undefined) {
              console.log('Progress:', progress);
              setProgress(progress);
            }
            break;

          case 'done':
            console.log('Download done:', e.data);
            setModelDownloading(false);
            setModelReady(true);
            setProgress(100);
            break;

          case 'ready':
            console.log('Model ready:', e.data);
            setModelReady(true);
            setModelDownloading(false);
            break;

          case 'complete':
            console.log('Summary complete:', e.data);
            setSummary(output);
            setLoading(false);
            break;

          case 'error':
            console.error('Worker error:', e.data);
            setError(workerError || 'An error occurred');
            setLoading(false);
            setModelDownloading(false);
            break;
        }
      };

      workerRef.current.addEventListener('message', onMessage);

      workerRef.current.postMessage({ type: 'ready', model: selectedModel });

      return () => {
        workerRef.current?.removeEventListener('message', onMessage);
        workerRef.current?.terminate();
      };
    }
  }, [selectedModel]);

  const summarizeText = () => {
    if (!inputText.trim()) {
      setError('Please enter some text to summarize');
      return;
    }

    setLoading(true);
    setError('');
    setSummary('');

    workerRef.current?.postMessage({
      type: 'summarize',
      text: inputText,
      model: selectedModel,
    });
  };

  const clear = () => {
    setInputText('');
    setSummary('');
    setError('');
    setProgress(0);
  };

  const loadSample = (type: 'article' | 'tech-doc' | 'news') => {
    const samples = {
      article: `Artificial intelligence (AI) has rapidly transformed numerous industries over the past decade. From healthcare to finance, AI systems are being deployed to improve efficiency, accuracy, and decision-making processes. In healthcare, AI-powered diagnostic tools can detect diseases like cancer at early stages, potentially saving countless lives. Financial institutions use AI algorithms for fraud detection, risk assessment, and automated trading, making transactions more secure and efficient. However, the rise of AI also brings significant challenges, including concerns about job displacement, algorithmic bias, and data privacy. As these technologies continue to evolve, it is crucial for policymakers, businesses, and society to work together to ensure that AI development and deployment are ethical, transparent, and beneficial for all. The future of AI holds immense promise, but it requires careful consideration and responsible implementation to maximize its positive impact on humanity.`,

      'tech-doc': `Next.js is a React framework that provides server-side rendering, static site generation, and other powerful features for building modern web applications. It was created by Vercel and has become one of the most popular frameworks for React developers. Next.js offers automatic code splitting, optimized images, and excellent search engine optimization out of the box. The framework supports both client-side and server-side rendering, giving developers the flexibility to choose the best approach for their specific use cases. With the introduction of the App Router in Next.js 13, the framework now supports React Server Components by default, enabling better performance and a more intuitive developer experience. Next.js also provides built-in support for API routes, allowing developers to build backend functionality directly within their frontend application. The framework has a vibrant community and extensive documentation, making it easy for developers to get started and find solutions to common problems. Many large companies, including Netflix, Uber, and Twitch, use Next.js to power their web applications.`,

      news: `SpaceX successfully launched its latest Starship rocket from the Starbase facility in Boca Chica, Texas. The massive vehicle, which stands 120 meters tall, lifted off at 9:30 AM Eastern Time under clear skies. This mission represents a significant milestone in SpaceX's ambitious goal of enabling human exploration of Mars. The Starship consists of two stages: the Super Heavy booster and the Starship spacecraft itself. Both stages are designed to be fully reusable, dramatically reducing the cost of space travel. The company's founder and CEO Elon Musk has stated that Starship will eventually carry both crew and cargo to the Moon, Mars, and beyond. Today's test flight was intended to gather valuable data on the vehicle's performance during ascent, orbital maneuvers, and reentry. NASA has selected Starship as the lunar lander for the Artemis program, which aims to return humans to the Moon by 2026. The successful demonstration of Starship's capabilities today brings humanity one step closer to becoming a multiplanetary species.`,
    };

    setInputText(samples[type]);
    setSummary('');
    setError('');
    setProgress(0);
  };

  return (
    <ToolLayout
      title="Text Summarization"
      description="Summarize long text into concise overviews using AI"
      fullWidth
    >
      <div className="space-y-6">
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

        {modelDownloading && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
            <p className="text-amber-800 text-sm">
              {progress > 0
                ? `⏳ Downloading AI model (${MODELS.find(m => m.value === selectedModel)?.size})... ${progress.toFixed(1)}%`
                : `⏳ Downloading AI model (${MODELS.find(m => m.value === selectedModel)?.size})...`
              }
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

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-blue-800 text-sm">
            <strong>What is Text Summarization?</strong> This AI tool can take long articles, documents, or any text and
            create a concise summary that captures the main points. It uses advanced natural language processing to understand
            the content and extract the most important information. Perfect for quickly understanding long documents, creating
            executive summaries, or getting the gist of lengthy articles!
          </p>
        </div>

        <div className="space-y-4">
          <TextArea
            value={inputText}
            onChange={setInputText}
            label="Text to Summarize"
            placeholder="Paste your article, document, or any text here... The AI will create a concise summary."
            rows={12}
          />

          <div className="flex gap-3 flex-wrap">
            <Button
              label={loading ? 'Summarizing...' : modelDownloading ? 'Loading model...' : 'Summarize'}
              onClick={summarizeText}
              variant="primary"
              disabled={loading}
            />
            <Button label="Article Sample" onClick={() => loadSample('article')} variant="secondary" />
            <Button label="Tech Doc Sample" onClick={() => loadSample('tech-doc')} variant="secondary" />
            <Button label="News Sample" onClick={() => loadSample('news')} variant="secondary" />
            <Button label="Clear" onClick={clear} variant="secondary" />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700 font-medium">Error:</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {summary && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Summary</h3>
              <p className="text-slate-900 leading-relaxed whitespace-pre-wrap">{summary}</p>
            </div>

            <div>
              <CodeDisplay
                code={JSON.stringify({
                  original_text_length: inputText.length,
                  summary_length: summary.length,
                  compression_ratio: ((1 - summary.length / inputText.length) * 100).toFixed(1) + '%',
                  summary_text: summary,
                  model: selectedModel,
                }, null, 2)}
                language="json"
                label="Summary Details"
              />
            </div>

            <div className="flex justify-end">
              <CopyButton
                text={summary}
                label="Copy Summary"
              />
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export default TextSummarization;
