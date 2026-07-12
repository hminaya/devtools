import type { Metadata } from 'next';
import YamlJsonConverter from '../../../components/tools/YamlJsonConverter/YamlJsonConverter';

export const metadata: Metadata = {
  title: 'YAML to JSON Converter & YAML Formatter | DevTools',
  description: 'Convert YAML to JSON and JSON to YAML, or format and validate standalone YAML. Auto-detects input format. Supports Docker Compose, Kubernetes configs, and any YAML/JSON data.',
  alternates: {
    canonical: '/tools/yaml-json-converter',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/yaml-json-converter',
    title: 'YAML/JSON Converter & YAML Formatter | DevTools',
    description: 'Convert between YAML and JSON, or format and validate standalone YAML online with auto-detection.',
    images: [{ url: '/og/tools/yaml-json-converter.png', width: 1200, height: 630, alt: 'YAML/JSON Converter & Formatter tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/yaml-json-converter.png'],
  },
};

export default function YamlJsonConverterPage() {
  return <YamlJsonConverter />;
}