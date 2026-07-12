import type { Metadata } from 'next';
import LineSorter from '../../../components/tools/LineSorter/LineSorter';

export const metadata: Metadata = {
  title: 'Line Sorter & Deduplicator - Sort and Dedupe Lines Online',
  description: 'Sort lines alphabetically, numerically, by length, or just deduplicate. Choose case-insensitive, exact, or trimmed matching.',
  alternates: {
    canonical: '/tools/line-sorter-dedup',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/line-sorter-dedup',
    title: 'Line Sorter & Deduplicator',
    description: 'Sort and deduplicate text lines with multiple modes and live count of duplicate removals.',
    images: [{ url: '/og/tools/line-sorter-dedup.png', width: 1200, height: 630, alt: 'Line Sorter & Deduplicator tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/line-sorter-dedup.png'],
  },
};

export default function LineSorterPage() {
  return <LineSorter />;
}