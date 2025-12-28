'use client';

import { useState, useEffect, useRef } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import CodeDisplay from '../../shared/CodeDisplay';

interface AnswerResult {
  answer: string;
  score: number;
  start: number;
  end: number;
}

function QuestionAnswering() {
  const [context, setContext] = useState('');
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [modelDownloading, setModelDownloading] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [error, setError] = useState('');
  const qaRef = useRef<any>(null);

  // Initialize AI model when component mounts
  useEffect(() => {
    if (!qaRef.current && !modelReady) {
      setModelDownloading(true);

      import('@xenova/transformers').then(async ({ pipeline, env }) => {
        try {
          // Configure for browser environment
          env.allowLocalModels = false;
          env.allowRemoteModels = true;

          // Initialize question-answering pipeline
          const qa = await pipeline(
            'question-answering',
            'Xenova/distilbert-base-uncased-distilled-squad'
          );

          qaRef.current = qa;
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

  const answerQuestion = async () => {
    if (!context.trim()) {
      setError('Please provide a context (document/text)');
      return;
    }

    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    if (!qaRef.current) {
      setError('AI model is still loading. Please wait and try again.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Perform question answering
      const answer = await qaRef.current(question, context);

      if (!answer || !answer.answer) {
        throw new Error('No answer found in the provided context');
      }

      setResult({
        answer: answer.answer,
        score: answer.score,
        start: answer.start,
        end: answer.end,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to answer question');
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setContext('');
    setQuestion('');
    setResult(null);
    setError('');
  };

  const loadSample = (type: 'tech-doc' | 'company-info' | 'api-doc') => {
    const samples = {
      'tech-doc': {
        context: `Next.js is a React framework for building full-stack web applications. You use React Components to build user interfaces, and Next.js for additional features and optimizations. Under the hood, Next.js also abstracts and automatically configures tooling needed for React, like bundling, compiling, and more. This allows you to focus on building your application instead of spending time with configuration. Whether you're an individual developer or part of a larger team, Next.js can help you build interactive, dynamic, and fast React applications. The framework supports both server-side rendering and static site generation, making it flexible for various use cases.`,
        question: 'What is Next.js?',
      },
      'company-info': {
        context: `Anthropic is an AI safety company that builds reliable, interpretable, and steerable AI systems. Founded in 2021 by former members of OpenAI, including Dario Amodei and Daniela Amodei, the company is focused on developing AI systems that are safe, beneficial, and aligned with human values. The company's flagship product is Claude, an AI assistant designed to be helpful, harmless, and honest. Anthropic has raised significant funding from investors including Google, Spark Capital, and others. The company is headquartered in San Francisco, California.`,
        question: 'When was Anthropic founded?',
      },
      'api-doc': {
        context: `The /v1/chat/completions endpoint accepts POST requests with a JSON payload containing the following parameters: "model" (required, string) - The model to use for completion, "messages" (required, array) - An array of message objects with role and content, "temperature" (optional, number, default: 1.0) - Controls randomness, range 0-2, "max_tokens" (optional, integer) - The maximum number of tokens to generate. The endpoint returns a JSON response with an "id", "object", "created" timestamp, "model", and "choices" array. Authentication requires an API key passed in the Authorization header as "Bearer YOUR_API_KEY". Rate limits apply based on your subscription tier.`,
        question: 'What authentication is required?',
      },
    };

    const sample = samples[type];
    setContext(sample.context);
    setQuestion(sample.question);
    setResult(null);
    setError('');
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-50 border-green-200';
    if (score >= 0.5) return 'bg-blue-50 border-blue-200';
    if (score >= 0.3) return 'bg-yellow-50 border-yellow-200';
    return 'bg-orange-50 border-orange-200';
  };

  const getConfidenceTextColor = (score: number) => {
    if (score >= 0.8) return 'text-green-700';
    if (score >= 0.5) return 'text-blue-700';
    if (score >= 0.3) return 'text-yellow-700';
    return 'text-orange-700';
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 0.8) return 'High Confidence';
    if (score >= 0.5) return 'Medium Confidence';
    if (score >= 0.3) return 'Low Confidence';
    return 'Very Low Confidence';
  };

  // Highlight the answer in the context
  const highlightAnswer = () => {
    if (!result || !context) return context;

    const before = context.slice(0, result.start);
    const answer = context.slice(result.start, result.end);
    const after = context.slice(result.end);

    return (
      <>
        {before}
        <mark className="bg-yellow-200 font-semibold">{answer}</mark>
        {after}
      </>
    );
  };

  return (
    <ToolLayout
      title="Question Answering"
      description="Answer questions based on provided context using AI"
      fullWidth
    >
      <div className="space-y-6">
        {/* Model Status */}
        {modelDownloading && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
            <p className="text-amber-800 text-sm">
              ⏳ Downloading AI model (~66MB)... This may take a moment on first use.
            </p>
          </div>
        )}

        {modelReady && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-green-800 text-sm">
              ✅ AI model ready (Xenova/distilbert-base-uncased-distilled-squad)
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-blue-800 text-sm">
            <strong>What is Question Answering?</strong> This AI tool can read a document or text (context) and answer
            specific questions about it. Just paste your documentation, article, or any text, then ask questions.
            The AI will extract precise answers directly from your context. Perfect for searching documentation,
            extracting specific information, or understanding long documents!
          </p>
        </div>

        {/* Input Section */}
        <div className="space-y-4">
          <TextArea
            value={context}
            onChange={setContext}
            label="Context (the document/text to search)"
            placeholder="Paste your documentation, article, or any text here... The AI will use this to answer your questions."
            rows={10}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Question
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What question do you want to ask about the context above?"
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && modelReady && !loading) {
                  answerQuestion();
                }
              }}
            />
          </div>

          <div className="flex gap-3 flex-wrap">
            <Button
              label={loading ? 'Finding answer...' : modelDownloading ? 'Loading model...' : 'Answer Question'}
              onClick={answerQuestion}
              variant="primary"
              disabled={loading || !modelReady}
            />
            <Button label="Tech Doc Sample" onClick={() => loadSample('tech-doc')} variant="secondary" />
            <Button label="Company Info Sample" onClick={() => loadSample('company-info')} variant="secondary" />
            <Button label="API Doc Sample" onClick={() => loadSample('api-doc')} variant="secondary" />
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
        {result && (
          <div className="space-y-4">
            {/* Answer Display */}
            <div className={`${getConfidenceColor(result.score)} border rounded-lg p-6`}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">Answer:</h3>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      result.score >= 0.8 ? 'bg-green-100 text-green-700' :
                      result.score >= 0.5 ? 'bg-blue-100 text-blue-700' :
                      result.score >= 0.3 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {getConfidenceLabel(result.score)}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 mb-2">{result.answer}</p>
                  <p className={`text-sm font-medium ${getConfidenceTextColor(result.score)}`}>
                    Confidence: {(result.score * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    result.score >= 0.8 ? 'bg-green-600' :
                    result.score >= 0.5 ? 'bg-blue-600' :
                    result.score >= 0.3 ? 'bg-yellow-600' :
                    'bg-orange-600'
                  }`}
                  style={{ width: `${result.score * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Question Display */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm font-medium text-purple-700 mb-1">Your Question:</p>
              <p className="text-purple-900">{question}</p>
            </div>

            {/* Context with Highlighted Answer */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="text-sm font-medium text-slate-700 mb-2">
                Answer location in context (highlighted):
              </p>
              <div className="text-sm text-slate-900 leading-relaxed whitespace-pre-wrap">
                {highlightAnswer()}
              </div>
            </div>

            {/* Raw JSON Results */}
            <div>
              <CodeDisplay
                code={JSON.stringify({
                  question: question,
                  answer: result.answer,
                  confidence: result.score,
                  confidence_percentage: `${(result.score * 100).toFixed(1)}%`,
                  position: {
                    start: result.start,
                    end: result.end,
                  },
                  model: 'Xenova/distilbert-base-uncased-distilled-squad',
                }, null, 2)}
                language="json"
                label="Raw JSON Results"
              />
            </div>

            {/* Copy Results */}
            <div className="flex justify-end">
              <CopyButton
                text={JSON.stringify({
                  question: question,
                  answer: result.answer,
                  confidence: result.score,
                  confidence_percentage: `${(result.score * 100).toFixed(1)}%`,
                  position: {
                    start: result.start,
                    end: result.end,
                  },
                  model: 'Xenova/distilbert-base-uncased-distilled-squad',
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

export default QuestionAnswering;
