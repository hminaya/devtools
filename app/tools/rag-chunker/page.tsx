import type { Metadata } from 'next';
import RagChunker from '../../../components/tools/RagChunker/RagChunker';

export const metadata: Metadata = {
  title: 'RAG Chunker - Token-Aware Text Chunking',
  description: 'Split text into retrieval-friendly chunks with token-aware sizing, overlap, and export formats. Offline RAG chunking tool for developers.',
  alternates: {
    canonical: '/tools/rag-chunker',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/rag-chunker',
    title: 'RAG Chunker - Offline Token-Aware Text Chunking Tool',
    description: 'Create retrieval-ready text chunks with configurable size, overlap, and export formats. Works fully offline in the browser.',
    images: [{ url: '/og/tools/rag-chunker.png', width: 1200, height: 630, alt: 'RAG Chunker tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/rag-chunker.png'],
  },
};

export default function RagChunkerPage() {
  return <RagChunker />;
}
