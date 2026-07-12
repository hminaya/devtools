import type { Metadata } from 'next';
import TextStatistics from '../../../components/tools/TextStatistics/TextStatistics';

export const metadata: Metadata = {
  title: 'Text Statistics - Word, Character, Sentence Counter',
  description: 'Live word count, character count (with and without spaces), sentence count, line count, paragraph count, reading time, and average length stats.',
  alternates: {
    canonical: '/tools/text-statistics',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/text-statistics',
    title: 'Text Statistics - Word & Character Counter',
    description: 'Live text analysis: word count, character count, sentence count, line count, paragraph count, reading time.',
    images: [{ url: '/og/tools/text-statistics.png', width: 1200, height: 630, alt: 'Text Statistics tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/text-statistics.png'],
  },
};

export default function TextStatisticsPage() {
  return <TextStatistics />;
}