import type { Metadata } from 'next';
import FillMask from '../../../components/tools/FillMask/FillMask';

export const metadata: Metadata = {
  title: 'Fill-Mask Text Completion - AI Word Prediction Tool',
  description: 'Free AI-powered fill-mask and text completion tool. Predict missing words, complete sentences, and get intelligent word suggestions in context. Perfect for writing assistance, fixing typos, and text completion. Runs locally in your browser.',
  alternates: {
    canonical: '/tools/fill-mask',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/fill-mask',
    title: 'Fill-Mask Text Completion - Free AI Tool',
    description: 'Complete sentences and predict missing words using AI. Get intelligent suggestions in context.',
    images: [{ url: '/og/tools/fill-mask.png', width: 1200, height: 630, alt: 'Fill-Mask Text Completion tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/fill-mask.png'],
  },
};

export default function FillMaskPage() {
  return <FillMask />;
}
