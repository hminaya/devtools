import type { Metadata } from 'next';
import JSTokenizer from '../../../components/tools/JSTokenizer/JSTokenizer';

export const metadata: Metadata = {
  title: 'JS Tokenizers - AI Token Counter',
  description: 'Free AI tokenizer tool supporting GPT-4, GPT-3.5 Turbo, Text-Davinci-003, and Davinci models. Count tokens for OpenAI API usage estimation using tiktoken and gpt-tokenizer. Includes character, word, and sentence tokenizers.',
  keywords: 'js tokenizer, ai tokenizer, gpt tokenizer, gpt-4 tokenizer, gpt-3.5 tokenizer, tiktoken, token counter, openai tokens, api token calculator, tokenize text, how many tokens is my text, count tokens for gpt, estimate openai api cost, how does gpt tokenize, token calculator chatgpt',
  openGraph: {
    url: 'https://developers.do/tools/js-tokenizer',
    title: 'JS Tokenizers - Free AI Token Counter for GPT-4 and GPT-3.5',
    description: 'Count tokens for GPT-4, GPT-3.5 Turbo, and other OpenAI models. Free AI tokenizer tool with support for tiktoken, gpt-tokenizer, and basic text tokenization.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function JSTokenizerPage() {
  return <JSTokenizer />;
}
