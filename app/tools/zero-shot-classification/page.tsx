import type { Metadata } from 'next';
import ZeroShotClassification from '../../../components/tools/ZeroShotClassification/ZeroShotClassification';

export const metadata: Metadata = {
  title: 'Zero-Shot Classification - AI Text Classifier',
  description: 'Free AI-powered zero-shot text classification tool. Classify text into custom categories without training. Perfect for categorizing bug reports, support tickets, feedback, and more. Runs locally in your browser.',
  keywords: 'zero-shot classification, text classification, AI classifier, NLP, machine learning, text categorization, bug report classification, support ticket classification, feedback analysis, transformers.js, how to classify text without training, categorize text with ai, automatic text labeling, classify emails or tickets',
  openGraph: {
    url: 'https://developers.do/tools/zero-shot-classification',
    title: 'Zero-Shot Classification - Free AI Text Classifier',
    description: 'Classify text into ANY custom categories without training using AI. Perfect for developers and data analysts.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function ZeroShotClassificationPage() {
  return <ZeroShotClassification />;
}
