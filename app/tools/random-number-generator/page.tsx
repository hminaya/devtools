import type { Metadata } from 'next';
import RandomNumberGenerator from '../../../components/tools/RandomNumberGenerator/RandomNumberGenerator';

export const metadata: Metadata = {
  title: 'Random Number Generator - TypeScript, C#, Swift, Kotlin, Go, Rust',
  description:
    'Free random number generator with custom range. View code samples in TypeScript, C#, Swift, Kotlin, Go, and Rust. Generate numbers instantly in your browser.',
  keywords:
    'random number generator, random number, RNG, TypeScript random, C# random, Swift random, Kotlin random, Go random, Rust random, random range, random integer, how to generate random number, random number between range, random integer generator, dice roller online, free online tool, browser-based, no install required',
  alternates: {
    canonical: '/tools/random-number-generator',
  },
  openGraph: {
    url: 'https://developers.do/tools/random-number-generator',
    title: 'Random Number Generator - Multi-Language Code Samples',
    description:
      'Generate random numbers with custom ranges and view implementation code in your favorite programming language.',
    images: [{ url: '/og/tools/random-number-generator.png', width: 1200, height: 630, alt: 'Developer Tools Dashboard' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/random-number-generator.png'],
  },
};

export default function RandomNumberGeneratorPage() {
  return <RandomNumberGenerator />;
}
