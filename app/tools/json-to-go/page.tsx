import type { Metadata } from 'next';
import JsonToGo from '../../../components/tools/JsonToGo/JsonToGo';

export const metadata: Metadata = {
  title: 'JSON to Go Converter - Generate Go Structs with JSON Tags',
  description: 'Free JSON to Go struct converter tool. Transform JSON objects into Go structs with proper JSON tags and pointer field detection. Perfect for Go developers.',
  alternates: {
    canonical: '/tools/json-to-go',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/json-to-go',
    title: 'JSON to Go - Free Struct Generator',
    description: 'Convert JSON to Go structs instantly with JSON tags and pointer detection.',
    images: [{ url: '/og/tools/json-to-go.png', width: 1200, height: 630, alt: 'JSON to Go tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/json-to-go.png'],
  },
};

export default function JsonToGoPage() {
  return <JsonToGo />;
}
