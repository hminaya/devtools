import type { Metadata } from 'next';
import RandomNumberGenerator from '../../../components/tools/RandomNumberGenerator/RandomNumberGenerator';

export const metadata: Metadata = {
  title: 'Random Number Generator - Secure CSPRNG + Code in 7 Languages',
  description:
    'Free random number generator with custom inclusive range. Cryptographically secure, with copy-ready code samples in TypeScript, C#, Swift, Kotlin, Go, and Rust.',
  alternates: {
    canonical: '/tools/random-number-generator',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/random-number-generator',
    title: 'Random Number Generator - Secure CSPRNG + Code in 7 Languages',
    description:
      'Generate cryptographically secure random numbers with custom ranges and view CSPRNG implementation code in your favorite programming language.',
    images: [{ url: '/og/tools/random-number-generator.png', width: 1200, height: 630, alt: 'Random Number Generator tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/random-number-generator.png'],
  },
};

export default function RandomNumberGeneratorPage() {
  return <RandomNumberGenerator />;
}
