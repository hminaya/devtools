import type { Metadata } from 'next';
import JsonToKotlin from '../../../components/tools/JsonToKotlin/JsonToKotlin';

export const metadata: Metadata = {
  title: 'JSON to Kotlin Converter - Generate Kotlin Data Classes',
  description: 'Free JSON to Kotlin converter tool. Transform JSON objects into Kotlin data classes with nullable field detection. Perfect for Android and backend developers.',
  alternates: {
    canonical: '/tools/json-to-kotlin',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/json-to-kotlin',
    title: 'JSON to Kotlin - Free Data Class Generator',
    description: 'Convert JSON to Kotlin data classes instantly with nullable field detection.',
    images: [{ url: '/og/tools/json-to-kotlin.png', width: 1200, height: 630, alt: 'JSON to Kotlin tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/json-to-kotlin.png'],
  },
};

export default function JsonToKotlinPage() {
  return <JsonToKotlin />;
}
