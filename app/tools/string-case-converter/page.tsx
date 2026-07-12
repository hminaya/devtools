import type { Metadata } from 'next';
import StringCaseConverter from '../../../components/tools/StringCaseConverter/StringCaseConverter';

export const metadata: Metadata = {
  title: 'String Case Converter - camelCase, snake_case, kebab, PascalCase',
  description: 'Convert text between camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, dot.case, path/case, title, and sentence case. Handles any mixed-format input.',
  alternates: {
    canonical: '/tools/string-case-converter',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/string-case-converter',
    title: 'String Case Converter - All Common Cases',
    description: 'Instantly convert text between camelCase, snake_case, kebab-case, PascalCase, and 7 more case styles.',
    images: [{ url: '/og/tools/string-case-converter.png', width: 1200, height: 630, alt: 'String Case Converter tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/string-case-converter.png'],
  },
};

export default function StringCaseConverterPage() {
  return <StringCaseConverter />;
}