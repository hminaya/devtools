import type { Metadata } from 'next';
import TextSummarization from '../../../components/tools/TextSummarization/TextSummarization';

export const metadata: Metadata = {
  title: 'Text Summarization - AI Article Summarizer',
  description: 'Free AI-powered text summarization tool. Quickly summarize long articles, documents, and any text into concise overviews. Perfect for researchers, students, and content creators. Runs locally in your browser.',
  keywords: 'text summarization, AI summarizer, article summarizer, document summary, automatic summarization, NLP, machine learning, text analysis, transformers.js, distilbart, abstractive summarization, how to summarize a long article, ai article summarizer free, shorten document online, tldr generator',
  alternates: {
    canonical: '/tools/text-summarization',
  },
  openGraph: {
    url: 'https://developers.do/tools/text-summarization',
    title: 'Text Summarization - Free AI Article Summarizer',
    description: 'Summarize long articles and documents into concise overviews using AI.',
    images: [{ url: '/og/tools/text-summarization.png', width: 1200, height: 630, alt: 'Developer Tools Dashboard' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/text-summarization.png'],
  },
};

export default function TextSummarizationPage() {
  return <TextSummarization />;
}
