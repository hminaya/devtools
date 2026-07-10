import type { Metadata } from 'next';
import JsonToCSharp from '../../../components/tools/JsonToCSharp/JsonToCSharp';

export const metadata: Metadata = {
  title: 'JSON to C# - Convert JSON to C# Classes',
  description: 'Free JSON to C# converter with syntax highlighting. Generate C# classes from JSON objects with optional JsonProperty attributes and PascalCase naming. Supports nullable property detection.',
  alternates: {
    canonical: '/tools/json-to-csharp',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/json-to-csharp',
    title: 'JSON to C# - Free Class Generator with Syntax Highlighting',
    description: 'Convert JSON to C# classes with JsonProperty attributes and PascalCase options. Free JSON to C# converter with nullable support.',
    images: [{ url: '/og/tools/json-to-csharp.png', width: 1200, height: 630, alt: 'Developer Tools Dashboard' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/json-to-csharp.png'],
  },
};

export default function JsonToCSharpPage() {
  return <JsonToCSharp />;
}
