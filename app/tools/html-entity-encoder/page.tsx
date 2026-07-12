import type { Metadata } from 'next';
import HtmlEntityEncoder from '../../../components/tools/HtmlEntityEncoder/HtmlEntityEncoder';

export const metadata: Metadata = {
  title: 'HTML Entity Encoder / Decoder - HTML Entities Online',
  description: 'Encode text to HTML entities (named, decimal, and hex) and decode entities back to characters. Handles the common HTML named entity set plus numeric references.',
  alternates: {
    canonical: '/tools/html-entity-encoder',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/html-entity-encoder',
    title: 'HTML Entity Encoder / Decoder',
    description: 'Encode and decode HTML entities — named, decimal, and hex references.',
    images: [{ url: '/og/tools/html-entity-encoder.png', width: 1200, height: 630, alt: 'HTML Entity Encoder tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/html-entity-encoder.png'],
  },
};

export default function HtmlEntityEncoderPage() {
  return <HtmlEntityEncoder />;
}