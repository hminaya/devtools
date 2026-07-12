import type { Metadata } from 'next';
import AsciiArtGenerator from '../../../components/tools/AsciiArtGenerator/AsciiArtGenerator';

export const metadata: Metadata = {
  title: 'ASCII Art Text Generator - Convert Text to ASCII Banner',
  description: 'Convert any text to ASCII art with built-in block, banner, and thin fonts. No external font files — works entirely in your browser. Adjustable letter spacing.',
  alternates: {
    canonical: '/tools/ascii-art-generator',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/ascii-art-generator',
    title: 'ASCII Art Text Generator',
    description: 'Generate ASCII art banners from text — block, banner, and thin fonts.',
    images: [{ url: '/og/tools/ascii-art-generator.png', width: 1200, height: 630, alt: 'ASCII Art Generator tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/ascii-art-generator.png'],
  },
};

export default function AsciiArtGeneratorPage() {
  return <AsciiArtGenerator />;
}