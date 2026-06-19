import type { Metadata } from 'next';
import YamlJsonConverter from '../../../components/tools/YamlJsonConverter/YamlJsonConverter';

export const metadata: Metadata = {
  title: 'YAML to JSON Converter - JSON to YAML Online | DevTools',
  description: 'Convert YAML to JSON and JSON to YAML online with auto-detection of input format. Supports Docker Compose, Kubernetes configs, and any YAML/JSON data.',
  keywords: 'yaml to json, json to yaml, yaml converter, yaml json converter, yaml online, convert yaml, docker compose yaml, kubernetes yaml',
  alternates: {
    canonical: '/tools/yaml-json-converter',
  },
  openGraph: {
    url: 'https://developers.do/tools/yaml-json-converter',
    title: 'YAML to JSON Converter - JSON to YAML Online | DevTools',
    description: 'Convert between YAML and JSON online with auto-detection. Supports any YAML or JSON data.',
    images: [{ url: '/og/tools/yaml-json-converter.png', width: 1200, height: 630, alt: 'Developer Tools Dashboard' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/yaml-json-converter.png'],
  },
};

export default function YamlJsonConverterPage() {
  return <YamlJsonConverter />;
}
