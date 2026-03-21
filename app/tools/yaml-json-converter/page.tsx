import type { Metadata } from 'next';
import YamlJsonConverter from '../../../components/tools/YamlJsonConverter/YamlJsonConverter';

export const metadata: Metadata = {
  title: 'YAML to JSON Converter - JSON to YAML Online | DevTools',
  description: 'Convert YAML to JSON and JSON to YAML online with auto-detection of input format. Supports Docker Compose, Kubernetes configs, and any YAML/JSON data.',
  keywords: 'yaml to json, json to yaml, yaml converter, yaml json converter, yaml online, convert yaml, docker compose yaml, kubernetes yaml',
  openGraph: {
    url: 'https://developers.do/tools/yaml-json-converter',
    title: 'YAML to JSON Converter - JSON to YAML Online | DevTools',
    description: 'Convert between YAML and JSON online with auto-detection. Supports any YAML or JSON data.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function YamlJsonConverterPage() {
  return <YamlJsonConverter />;
}
