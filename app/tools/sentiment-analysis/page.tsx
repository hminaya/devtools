import type { Metadata } from 'next';
import SentimentAnalysis from '../../../components/tools/SentimentAnalysis/SentimentAnalysis';

export const metadata: Metadata = {
  title: 'Sentiment Analysis - Free Online AI Tool | DevTools',
  description: 'Analyze the emotional tone of text using lexicon-based or AI-powered sentiment analysis. Detect positive, negative, or neutral sentiment in reviews, feedback, and social media posts. Runs entirely in your browser.',
  keywords: 'sentiment analysis, emotion detection, text analysis, AI sentiment, positive negative neutral, review analysis, feedback analysis, NLP, natural language processing, transformers.js, BERT model, client-side AI, how to analyze text sentiment, is this review positive or negative, detect emotion in text, sentiment score online',
  openGraph: {
    url: 'https://developers.do/tools/sentiment-analysis',
    title: 'Sentiment Analysis - Free AI Sentiment Detection Tool',
    description: 'Detect positive, negative, or neutral sentiment in any text using in-browser AI. No data sent to servers.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function SentimentAnalysisPage() {
  return <SentimentAnalysis />;
}
