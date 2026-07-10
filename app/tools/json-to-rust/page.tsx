import type { Metadata } from 'next';
import JsonToRust from '../../../components/tools/JsonToRust/JsonToRust';

export const metadata: Metadata = {
  title: 'JSON to Rust Converter - Generate Rust Structs with Serde',
  description: 'Free JSON to Rust struct converter tool. Transform JSON objects into Rust structs with Serde support and Option field detection. Perfect for Rust developers.',
  alternates: {
    canonical: '/tools/json-to-rust',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/json-to-rust',
    title: 'JSON to Rust - Free Struct Generator with Serde',
    description: 'Convert JSON to Rust structs instantly with Serde support and Option detection.',
    images: [{ url: '/og/tools/json-to-rust.png', width: 1200, height: 630, alt: 'Developer Tools Dashboard' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/json-to-rust.png'],
  },
};

export default function JsonToRustPage() {
  return <JsonToRust />;
}
