import type { Metadata } from 'next';
import RagChunker from '../../../components/tools/RagChunker/RagChunker';

export const metadata: Metadata = {
  title: 'RAG Chunker - Token-Aware Text Chunking',
  description: 'Split text into retrieval-friendly chunks with token-aware sizing, overlap, and export formats. Offline RAG chunking tool for developers.',
  keywords: 'rag chunker, text chunking, token chunker, retrieval augmented generation, document splitter, embedding chunks, context window, how to chunk text for rag, split documents for embeddings, how to chunk for langchain, llm context window splitter',
  openGraph: {
    url: 'https://developers.do/tools/rag-chunker',
    title: 'RAG Chunker - Offline Token-Aware Text Chunking Tool',
    description: 'Create retrieval-ready text chunks with configurable size, overlap, and export formats. Works fully offline in the browser.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function RagChunkerPage() {
  return <RagChunker />;
}
