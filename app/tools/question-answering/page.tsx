import type { Metadata } from 'next';
import QuestionAnswering from '../../../components/tools/QuestionAnswering/QuestionAnswering';

export const metadata: Metadata = {
  title: 'Question Answering - AI Document Search Tool',
  description: 'Free AI-powered question answering tool. Ask questions about any document or text and get precise answers extracted by AI. Perfect for searching documentation, extracting information, and understanding long documents. Runs locally in your browser.',
  keywords: 'question answering, AI search, document search, text extraction, NLP, machine learning, documentation search, information extraction, reading comprehension, transformers.js, squad, distilbert',
  openGraph: {
    url: 'https://developers.do/tools/question-answering',
    title: 'Question Answering - Free AI Document Search',
    description: 'Ask questions about any document and get AI-powered answers extracted from your text.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function QuestionAnsweringPage() {
  return <QuestionAnswering />;
}
