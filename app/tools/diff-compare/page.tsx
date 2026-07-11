import type { Metadata } from 'next';
import DiffCompare from '../../../components/tools/DiffCompare/DiffCompare';

export const metadata: Metadata = {
  title: 'Diff / Text Compare - Compare Texts Side by Side',
  description: 'Free online diff tool to compare two texts and see color-coded differences. Line-by-line comparison with added, removed, and unchanged highlighting. Runs entirely in your browser.',
  alternates: {
    canonical: '/tools/diff-compare',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/diff-compare',
    title: 'Diff / Text Compare - Free Online Text Comparison Tool',
    description: 'Compare two texts side by side with color-coded diffs. See added, removed, and unchanged lines at a glance.',
    images: [{ url: '/og/tools/diff-compare.png', width: 1200, height: 630, alt: 'Diff / Text Compare tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/diff-compare.png'],
  },
};

export default function DiffComparePage() {
  return <DiffCompare />;
}
