import type { Metadata } from 'next';
import WhitespaceCleaner from '../../../components/tools/WhitespaceCleaner/WhitespaceCleaner';

export const metadata: Metadata = {
  title: 'Whitespace Visualizer & Cleaner - Spot Invisible Characters',
  description: 'Visualize tabs, non-breaking spaces, zero-width characters, and trailing whitespace, then clean them up with batch options (trim lines, collapse spaces, remove blank lines, normalize line endings).',
  alternates: {
    canonical: '/tools/whitespace-cleaner',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/whitespace-cleaner',
    title: 'Whitespace Visualizer & Cleaner',
    description: 'Spot invisible whitespace characters and clean up mixed line endings, trailing spaces, and tabs.',
    images: [{ url: '/og/tools/whitespace-cleaner.png', width: 1200, height: 630, alt: 'Whitespace Visualizer & Cleaner tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/whitespace-cleaner.png'],
  },
};

export default function WhitespaceCleanerPage() {
  return <WhitespaceCleaner />;
}