import type { Metadata } from 'next';
import TextSummarization from '../../../components/tools/TextSummarization/TextSummarization';

export const metadata: Metadata = {
  title: 'Text Summarization - AI Article Summarizer',
  description: 'Free AI-powered text summarization tool. Quickly summarize long articles, documents, and any text into concise overviews. Perfect for researchers, students, and content creators. Runs locally in your browser.',
  keywords: 'text summarization, AI summarizer, article summarizer, document summary, automatic summarization, NLP, machine learning, text analysis, transformers.js, distilbart, abstractive summarization',
  openGraph: {
    url: 'https://developers.do/tools/text-summarization',
    title: 'Text Summarization - Free AI Article Summarizer',
    description: 'Summarize long articles and documents into concise overviews using AI.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function TextSummarizationPage() {
  return <TextSummarization />;
}
