import type { Metadata } from 'next';
import JsonToTypeScript from '../../../components/tools/JsonToTypeScript/JsonToTypeScript';

export const metadata: Metadata = {
  title: 'JSON to TypeScript - Convert JSON to TypeScript Interfaces',
  description: 'Free JSON to TypeScript converter with syntax highlighting. Generate TypeScript interfaces from JSON objects. Supports multiple samples to detect optional fields, nested objects, and arrays.',
  keywords: 'json to typescript, json to ts, typescript interface generator, json converter, typescript types, generate typescript, json to type, how to convert json to typescript, generate typescript interface from json, json to ts online free, typescript type generator',
  alternates: {
    canonical: '/tools/json-to-typescript',
  },
  openGraph: {
    url: 'https://developers.do/tools/json-to-typescript',
    title: 'JSON to TypeScript - Free Interface Generator with Syntax Highlighting',
    description: 'Convert JSON to TypeScript interfaces instantly. Supports optional field detection and nested objects. Free JSON to TypeScript converter.',
    images: [{ url: '/og/tools/json-to-typescript.png', width: 1200, height: 630, alt: 'Developer Tools Dashboard' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/json-to-typescript.png'],
  },
};

export default function JsonToTypeScriptPage() {
  return <JsonToTypeScript />;
}
