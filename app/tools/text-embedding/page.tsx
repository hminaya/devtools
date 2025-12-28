import type { Metadata } from 'next';
import TextEmbedding from '../../../components/tools/TextEmbedding/TextEmbedding';

export const metadata: Metadata = {
  title: 'Text Embedding & Semantic Similarity - AI Similarity Finder',
  description: 'Free AI-powered text embedding and semantic similarity tool. Find similar texts, detect duplicates, and perform semantic search using machine learning. Perfect for finding similar bug reports, duplicate content, and related documents. Runs locally in your browser.',
  keywords: 'text embedding, semantic similarity, cosine similarity, duplicate detection, semantic search, text matching, NLP, machine learning, vector similarity, transformers.js, all-MiniLM-L6-v2',
  openGraph: {
    url: 'https://developers.do/tools/text-embedding',
    title: 'Text Embedding & Semantic Similarity - Free AI Tool',
    description: 'Find semantically similar texts using AI embeddings. Perfect for duplicate detection and semantic search.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function TextEmbeddingPage() {
  return <TextEmbedding />;
}
