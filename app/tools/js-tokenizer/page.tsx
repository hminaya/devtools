import type { Metadata } from 'next';
import JSTokenizer from '../../../components/tools/JSTokenizer/JSTokenizer';

export const metadata: Metadata = {
  title: 'JS Tokenizers - AI Token Counter',
  description: 'Free AI tokenizer tool supporting GPT-4, GPT-3.5 Turbo, Text-Davinci-003, and Davinci models. Count tokens for OpenAI API usage estimation using tiktoken and gpt-tokenizer. Includes character, word, and sentence tokenizers.',
  alternates: {
    canonical: '/tools/js-tokenizer',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/js-tokenizer',
    title: 'JS Tokenizers - Free AI Token Counter for GPT-4 and GPT-3.5',
    description: 'Count tokens for GPT-4, GPT-3.5 Turbo, and other OpenAI models. Free AI tokenizer tool with support for tiktoken, gpt-tokenizer, and basic text tokenization.',
    images: [{ url: '/og/tools/js-tokenizer.png', width: 1200, height: 630, alt: 'Developer Tools Dashboard' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/js-tokenizer.png'],
  },
};

export default function JSTokenizerPage() {
  return <JSTokenizer />;
}
