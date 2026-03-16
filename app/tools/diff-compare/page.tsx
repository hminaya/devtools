import type { Metadata } from 'next';
import DiffCompare from '../../../components/tools/DiffCompare/DiffCompare';

export const metadata: Metadata = {
  title: 'Diff / Text Compare - Compare Texts Side by Side',
  description: 'Free online diff tool to compare two texts and see color-coded differences. Line-by-line comparison with added, removed, and unchanged highlighting. Runs entirely in your browser.',
  keywords: 'diff tool, text compare, text diff, compare text online, unified diff, line diff, code diff, file compare, how to compare two files online, text diff checker free, find differences between texts, compare clipboard text',
  openGraph: {
    url: 'https://developers.do/tools/diff-compare',
    title: 'Diff / Text Compare - Free Online Text Comparison Tool',
    description: 'Compare two texts side by side with color-coded diffs. See added, removed, and unchanged lines at a glance.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function DiffComparePage() {
  return <DiffCompare />;
}
