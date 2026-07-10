import type { Metadata } from 'next';
import StringSimilarity from '../../../components/tools/StringSimilarity/StringSimilarity';

export const metadata: Metadata = {
  title: 'String Similarity Calculator - Jaro-Winkler, Levenshtein & More',
  description:
    'Compare strings using Jaro-Winkler, Levenshtein, Dice coefficient, and Hamming distance algorithms. Free online string similarity tool for fuzzy matching and text comparison.',
  alternates: {
    canonical: '/tools/string-similarity',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/string-similarity',
    title: 'String Similarity Calculator - Jaro-Winkler, Levenshtein & More',
    description: 'Compare strings using multiple similarity algorithms including Jaro-Winkler, Levenshtein, and more.',
    images: [{ url: '/og/tools/string-similarity.png', width: 1200, height: 630, alt: 'Developer Tools Dashboard' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/string-similarity.png'],
  },
};

export default function StringSimilarityPage() {
  return <StringSimilarity />;
}
