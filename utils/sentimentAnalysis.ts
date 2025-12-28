/**
 * Sentiment Analysis Utility
 * Supports both lexicon-based and AI-based analysis
 */

export type AnalysisMethod = 'lexicon' | 'transformers';

export interface SentimentResult {
  success: boolean;
  label?: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  score?: number; // Confidence score (0-1)
  comparative?: number; // Normalized score for lexicon mode
  positive?: string[];
  negative?: string[];
  error?: string;
}

// Simple sentiment lexicon
const POSITIVE_WORDS = [
  'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'awesome',
  'love', 'happy', 'joy', 'perfect', 'best', 'beautiful', 'brilliant', 'outstanding',
  'superb', 'terrific', 'fabulous', 'magnificent', 'incredible', 'delightful',
  'pleasant', 'enjoy', 'satisfied', 'glad', 'pleased', 'excited', 'thrilled',
  'fortunate', 'blessed', 'grateful', 'appreciate', 'admire', 'impressive',
  'stellar', 'exceptional', 'remarkable', 'phenomenal', 'splendid', 'marvelous',
];

const NEGATIVE_WORDS = [
  'bad', 'terrible', 'awful', 'horrible', 'poor', 'worst', 'hate', 'sad',
  'angry', 'disappointed', 'disappointing', 'unfortunate', 'upset', 'annoyed',
  'frustrated', 'disgusting', 'disgusted', 'appalling', 'dreadful', 'pathetic',
  'miserable', 'unhappy', 'depressed', 'regret', 'shame', 'fail', 'failed',
  'failure', 'useless', 'worthless', 'inferior', 'subpar', 'mediocre', 'flawed',
  'defective', 'broken', 'wrong', 'negative', 'harmful', 'damaging',
];

// Assign sentiment scores to words
const WORD_SCORES: Record<string, number> = {};
POSITIVE_WORDS.forEach(word => WORD_SCORES[word] = 2);
NEGATIVE_WORDS.forEach(word => WORD_SCORES[word] = -2);

// Strong positive/negative modifiers
const STRONG_POSITIVE = ['very', 'extremely', 'absolutely', 'really', 'super', 'incredibly'];
const STRONG_NEGATIVE = ['never', 'not', 'no', "n't", 'without', 'hardly'];

/**
 * Lexicon-based sentiment analysis
 */
function analyzeLexicon(text: string): SentimentResult {
  try {
    if (!text.trim()) {
      return { success: false, error: 'Please enter some text to analyze' };
    }

    // Tokenize and clean
    const words = text
      .toLowerCase()
      .replace(/[^\w\s']/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 0);

    let score = 0;
    const positive: string[] = [];
    const negative: string[] = [];
    let multiplier = 1;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (!word) continue;

      // Check for modifiers
      if (STRONG_POSITIVE.includes(word)) {
        multiplier = 1.5;
        continue;
      }
      if (STRONG_NEGATIVE.includes(word)) {
        multiplier = -1;
        continue;
      }

      // Check sentiment
      if (WORD_SCORES[word]) {
        const wordScore = WORD_SCORES[word] * multiplier;
        score += wordScore;

        if (wordScore > 0) {
          positive.push(word);
        } else {
          negative.push(word);
        }

        multiplier = 1; // Reset multiplier
      }
    }

    // Calculate comparative score (normalized by word count)
    const comparative = words.length > 0 ? score / words.length : 0;

    // Determine label
    let label: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    if (score > 0) {
      label = 'POSITIVE';
    } else if (score < 0) {
      label = 'NEGATIVE';
    } else {
      label = 'NEUTRAL';
    }

    // Calculate confidence as a percentage (0-1)
    // Based on comparative score, capped at 1.0
    const confidence = Math.min(Math.abs(comparative) / 2, 1);

    return {
      success: true,
      label,
      score: confidence,
      comparative,
      positive,
      negative,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze sentiment',
    };
  }
}

/**
 * Main sentiment analysis function (lexicon-based only)
 * AI-based analysis is handled directly in the component
 */
export async function analyzeSentiment(
  text: string,
  method: AnalysisMethod
): Promise<SentimentResult> {
  return analyzeLexicon(text);
}
