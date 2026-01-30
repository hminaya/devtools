'use client';

import { useState } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import Button from '../../shared/Button';
import {
  type SimilarityAlgorithm,
  computeSimilarity,
  getSampleStrings,
  algorithmDescriptions,
} from '../../../utils/stringSimilarity';

const algorithms: { value: SimilarityAlgorithm; label: string }[] = [
  { value: 'jaro-winkler', label: 'Jaro-Winkler' },
  { value: 'levenshtein', label: 'Levenshtein' },
  { value: 'dice', label: 'Dice Coefficient' },
  { value: 'hamming', label: 'Hamming' },
];

export default function StringSimilarity() {
  const [string1, setString1] = useState('');
  const [string2, setString2] = useState('');
  const [algorithm, setAlgorithm] = useState<SimilarityAlgorithm>('jaro-winkler');
  const [result, setResult] = useState<{
    score: number;
    percentage: string;
    description: string;
  } | null>(null);

  const handleCompare = () => {
    if (!string1.trim() || !string2.trim()) return;
    const similarity = computeSimilarity(string1, string2, algorithm);
    setResult({
      score: similarity.score,
      percentage: similarity.percentage,
      description: similarity.description,
    });
  };

  const handleClear = () => {
    setString1('');
    setString2('');
    setResult(null);
  };

  const handleLoadSample = () => {
    const sample = getSampleStrings();
    setString1(sample.string1);
    setString2(sample.string2);
    setResult(null);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.5) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBarColor = (score: number): string => {
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.5) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <ToolLayout
      title="String Similarity"
      description="Compare two strings using various similarity algorithms"
    >
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-green-800 text-sm">
            Compare how similar two strings are using different algorithms. Each algorithm
            has different strengths depending on your use case.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Algorithm
          </label>
          <select
            value={algorithm}
            onChange={(e) => {
              setAlgorithm(e.target.value as SimilarityAlgorithm);
              setResult(null);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {algorithms.map((alg) => (
              <option key={alg.value} value={alg.value}>
                {alg.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            {algorithmDescriptions[algorithm]}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextArea
            label="String 1"
            value={string1}
            onChange={setString1}
            placeholder="Enter first string..."
            rows={3}
          />
          <TextArea
            label="String 2"
            value={string2}
            onChange={setString2}
            placeholder="Enter second string..."
            rows={3}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button label="Compare" onClick={handleCompare} variant="primary" />
          <Button label="Load Sample" onClick={handleLoadSample} variant="secondary" />
          <Button label="Clear" onClick={handleClear} variant="secondary" />
        </div>

        {result && (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-6">
            <div className="text-center mb-4">
              <span className={`text-5xl font-bold ${getScoreColor(result.score)}`}>
                {result.percentage}
              </span>
              <p className="text-gray-600 mt-2">Similarity Score</p>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${getScoreBarColor(result.score)}`}
                style={{ width: `${result.score * 100}%` }}
              />
            </div>

            <p className="text-sm text-gray-600 text-center">{result.description}</p>
          </div>
        )}

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Algorithm Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {algorithms.map((alg) => (
              <div
                key={alg.value}
                className="bg-white border border-gray-200 rounded-md p-4"
              >
                <h4 className="font-medium text-gray-900">{alg.label}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {algorithmDescriptions[alg.value]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
