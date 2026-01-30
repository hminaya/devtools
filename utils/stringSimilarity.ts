export type SimilarityAlgorithm =
  | 'jaro-winkler'
  | 'levenshtein'
  | 'dice'
  | 'hamming';

export interface SimilarityResult {
  algorithm: SimilarityAlgorithm;
  score: number;
  percentage: string;
  description: string;
}

export const algorithmDescriptions: Record<SimilarityAlgorithm, string> = {
  'jaro-winkler': 'Best for short strings like names. Gives higher scores to strings with matching prefixes.',
  'levenshtein': 'Counts minimum edits (insertions, deletions, substitutions) needed to transform one string into another.',
  'dice': 'Compares bigram (2-character) overlap between strings. Good for longer text.',
  'hamming': 'Counts positions where characters differ. Only works on equal-length strings.',
};

function jaroSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;

  const matchWindow = Math.floor(Math.max(s1.length, s2.length) / 2) - 1;
  const s1Matches = new Array(s1.length).fill(false);
  const s2Matches = new Array(s2.length).fill(false);

  let matches = 0;
  let transpositions = 0;

  for (let i = 0; i < s1.length; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, s2.length);

    for (let j = start; j < end; j++) {
      if (s2Matches[j] || s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0;

  let k = 0;
  for (let i = 0; i < s1.length; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }

  return (
    (matches / s1.length +
      matches / s2.length +
      (matches - transpositions / 2) / matches) /
    3
  );
}

export function jaroWinkler(s1: string, s2: string, prefixScale = 0.1): number {
  const jaroScore = jaroSimilarity(s1, s2);

  let prefixLength = 0;
  const maxPrefix = Math.min(4, Math.min(s1.length, s2.length));

  for (let i = 0; i < maxPrefix; i++) {
    if (s1[i] === s2[i]) {
      prefixLength++;
    } else {
      break;
    }
  }

  return jaroScore + prefixLength * prefixScale * (1 - jaroScore);
}

export function levenshteinDistance(s1: string, s2: string): number {
  if (s1.length === 0) return s2.length;
  if (s2.length === 0) return s1.length;

  const matrix: number[][] = Array.from({ length: s2.length + 1 }, () =>
    Array(s1.length + 1).fill(0)
  );

  for (let i = 0; i <= s2.length; i++) {
    matrix[i]![0] = i;
  }

  for (let j = 0; j <= s1.length; j++) {
    matrix[0]![j] = j;
  }

  for (let i = 1; i <= s2.length; i++) {
    for (let j = 1; j <= s1.length; j++) {
      if (s2[i - 1] === s1[j - 1]) {
        matrix[i]![j] = matrix[i - 1]![j - 1]!;
      } else {
        matrix[i]![j] = Math.min(
          matrix[i - 1]![j - 1]! + 1,
          matrix[i]![j - 1]! + 1,
          matrix[i - 1]![j]! + 1
        );
      }
    }
  }

  return matrix[s2.length]![s1.length]!;
}

export function levenshteinSimilarity(s1: string, s2: string): number {
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1;
  const distance = levenshteinDistance(s1, s2);
  return 1 - distance / maxLen;
}

function getBigrams(str: string): Set<string> {
  const bigrams = new Set<string>();
  for (let i = 0; i < str.length - 1; i++) {
    bigrams.add(str.substring(i, i + 2));
  }
  return bigrams;
}

export function diceCoefficient(s1: string, s2: string): number {
  if (s1.length < 2 || s2.length < 2) {
    return s1 === s2 ? 1 : 0;
  }

  const bigrams1 = getBigrams(s1);
  const bigrams2 = getBigrams(s2);

  let intersection = 0;
  for (const bigram of bigrams1) {
    if (bigrams2.has(bigram)) {
      intersection++;
    }
  }

  return (2 * intersection) / (bigrams1.size + bigrams2.size);
}

export function hammingDistance(s1: string, s2: string): number | null {
  if (s1.length !== s2.length) return null;

  let distance = 0;
  for (let i = 0; i < s1.length; i++) {
    if (s1[i] !== s2[i]) distance++;
  }
  return distance;
}

export function hammingSimilarity(s1: string, s2: string): number | null {
  if (s1.length !== s2.length) return null;
  if (s1.length === 0) return 1;

  const distance = hammingDistance(s1, s2);
  if (distance === null) return null;

  return 1 - distance / s1.length;
}

export function computeSimilarity(
  s1: string,
  s2: string,
  algorithm: SimilarityAlgorithm
): SimilarityResult {
  let score: number;
  let description = algorithmDescriptions[algorithm];

  switch (algorithm) {
    case 'jaro-winkler':
      score = jaroWinkler(s1, s2);
      break;
    case 'levenshtein':
      score = levenshteinSimilarity(s1, s2);
      break;
    case 'dice':
      score = diceCoefficient(s1, s2);
      break;
    case 'hamming':
      const hammingScore = hammingSimilarity(s1, s2);
      if (hammingScore === null) {
        score = 0;
        description = 'Hamming distance requires strings of equal length.';
      } else {
        score = hammingScore;
      }
      break;
  }

  return {
    algorithm,
    score,
    percentage: (score * 100).toFixed(1) + '%',
    description,
  };
}

export function getSampleStrings(): { string1: string; string2: string } {
  const samples = [
    { string1: 'MARTHA', string2: 'MARHTA' },
    { string1: 'DIXON', string2: 'DICKSONX' },
    { string1: 'JELLYFISH', string2: 'SMELLYFISH' },
    { string1: 'kitten', string2: 'sitting' },
    { string1: 'Saturday', string2: 'Sunday' },
    { string1: 'developers.do', string2: 'developer.do' },
  ];
  return samples[Math.floor(Math.random() * samples.length)]!;
}
