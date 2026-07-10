import type { Metadata } from 'next';
import TextEmbedding from '../../../components/tools/TextEmbedding/TextEmbedding';

export const metadata: Metadata = {
  title: 'Sentence Similarity - AI Similarity Finder',
  description: 'Free AI-powered sentence similarity tool. Find similar texts, detect duplicates, and perform semantic search using machine learning. Perfect for finding similar bug reports, duplicate content, and related documents. Runs locally in your browser.',
  alternates: {
    canonical: '/tools/sentence-similarity',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/sentence-similarity',
    title: 'Sentence Similarity - Free AI Tool',
    description: 'Find semantically similar texts using AI embeddings. Perfect for duplicate detection and semantic search.',
    images: [{ url: '/og/tools/sentence-similarity.png', width: 1200, height: 630, alt: 'Developer Tools Dashboard' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/sentence-similarity.png'],
  },
};

export default function TextEmbeddingPage() {
  return <TextEmbedding />;
}
