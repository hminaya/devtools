import type { Metadata } from 'next';
import StringSimilarity from '../../../components/tools/StringSimilarity/StringSimilarity';

export const metadata: Metadata = {
  title: 'String Similarity Calculator - Jaro-Winkler, Levenshtein & More',
  description:
    'Compare strings using Jaro-Winkler, Levenshtein, Dice coefficient, and Hamming distance algorithms. Free online string similarity tool for fuzzy matching and text comparison.',
  keywords:
    'string similarity, jaro winkler, levenshtein distance, dice coefficient, hamming distance, fuzzy matching, text comparison, string distance, how similar are two strings, fuzzy string match online, find edit distance between strings, detect near-duplicate text',
  openGraph: {
    url: 'https://developers.do/tools/string-similarity',
    title: 'String Similarity Calculator - Jaro-Winkler, Levenshtein & More',
    description: 'Compare strings using multiple similarity algorithms including Jaro-Winkler, Levenshtein, and more.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function StringSimilarityPage() {
  return <StringSimilarity />;
}
