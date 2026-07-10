import type { Metadata } from 'next';
import ZeroShotClassification from '../../../components/tools/ZeroShotClassification/ZeroShotClassification';

export const metadata: Metadata = {
  title: 'Zero-Shot Classification - AI Text Classifier',
  description: 'Free AI-powered zero-shot text classification tool. Classify text into custom categories without training. Perfect for categorizing bug reports, support tickets, feedback, and more. Runs locally in your browser.',
  alternates: {
    canonical: '/tools/zero-shot-classification',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/zero-shot-classification',
    title: 'Zero-Shot Classification - Free AI Text Classifier',
    description: 'Classify text into ANY custom categories without training using AI. Perfect for developers and data analysts.',
    images: [{ url: '/og/tools/zero-shot-classification.png', width: 1200, height: 630, alt: 'Developer Tools Dashboard' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/zero-shot-classification.png'],
  },
};

export default function ZeroShotClassificationPage() {
  return <ZeroShotClassification />;
}
