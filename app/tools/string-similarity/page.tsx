import type { Metadata } from 'next';
import StringSimilarity from '../../../components/tools/StringSimilarity/StringSimilarity';

export const metadata: Metadata = {
  title: 'String Similarity Calculator - Jaro-Winkler, Levenshtein & More',
  description:
    'Compare strings using Jaro-Winkler, Levenshtein, Dice coefficient, and Hamming distance algorithms. Free online string similarity tool for fuzzy matching and text comparison.',
  keywords:
    'string similarity, jaro winkler, levenshtein distance, dice coefficient, hamming distance, fuzzy matching, text comparison, string distance',
  openGraph: {
    title: 'String Similarity Calculator',
    description:
      'Compare strings using multiple similarity algorithms including Jaro-Winkler, Levenshtein, and more.',
    type: 'website',
  },
};

export default function StringSimilarityPage() {
  return <StringSimilarity />;
}
