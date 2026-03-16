import type { Metadata } from 'next';
import LoremIpsumGenerator from '../../../components/tools/LoremIpsumGenerator/LoremIpsumGenerator';

export const metadata: Metadata = {
  title: 'Lorem Ipsum Generator - Placeholder Text Generator',
  description: 'Free Lorem Ipsum generator for creating placeholder text. Generate paragraphs, sentences, or words. Option to start with "Lorem ipsum dolor sit amet". Perfect for design mockups and testing.',
  keywords: 'lorem ipsum generator, placeholder text, dummy text, lorem ipsum, text generator, filler text, sample text, how to generate placeholder text, dummy text for website, filler text generator online, lorem ipsum online',
  openGraph: {
    url: 'https://developers.do/tools/lorem-ipsum-generator',
    title: 'Lorem Ipsum Generator - Free Placeholder Text Creator',
    description: 'Generate Lorem Ipsum placeholder text by paragraphs, sentences, or words. Free dummy text generator for designs and mockups.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function LoremIpsumGeneratorPage() {
  return <LoremIpsumGenerator />;
}
