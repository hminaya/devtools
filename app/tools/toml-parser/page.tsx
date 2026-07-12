import type { Metadata } from 'next';
import TomlParser from '../../../components/tools/TomlParser/TomlParser';

export const metadata: Metadata = {
  title: 'TOML Parser - Parse, Validate, Format & Convert TOML',
  description: 'Parse TOML into JSON, validate it, re-format, or convert between TOML and JSON. Spec-compliant via smol-toml; supports dates, nested tables, arrays, and inline tables.',
  alternates: {
    canonical: '/tools/toml-parser',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/toml-parser',
    title: 'TOML Parser',
    description: 'Parse, validate, format, and round-trip TOML to/from JSON.',
    images: [{ url: '/og/tools/toml-parser.png', width: 1200, height: 630, alt: 'TOML Parser tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/toml-parser.png'],
  },
};

export default function TomlParserPage() {
  return <TomlParser />;
}