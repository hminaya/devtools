import type { Metadata } from 'next';
import SentimentAnalysis from '../../../components/tools/SentimentAnalysis/SentimentAnalysis';

export const metadata: Metadata = {
  title: 'Sentiment Analysis Tool - Detect Positive, Negative or Neutral Text',
  description: 'Analyze reviews, feedback, and social posts for positive, negative, or neutral sentiment using fast lexicon scoring or an in-browser AI model.',
  alternates: {
    canonical: '/tools/sentiment-analysis',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/sentiment-analysis',
    title: 'Sentiment Analysis Tool - Free Text Sentiment Detector',
    description: 'Detect positive, negative, or neutral sentiment in reviews, feedback, and social posts using fast scoring or in-browser AI.',
    images: [{ url: '/og/tools/sentiment-analysis.png', width: 1200, height: 630, alt: 'Sentiment Analysis tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/sentiment-analysis.png'],
  },
};

export default function SentimentAnalysisPage() {
  return <SentimentAnalysis />;
}
