import type { Metadata } from 'next';
import JsonPathTester from '../../../components/tools/JsonPathTester/JsonPathTester';

export const metadata: Metadata = {
  title: 'JSONPath Query Engine - Test JSONPath Expressions Online',
  description: 'Test JSONPath expressions against your JSON data — supports dot/bracket access, wildcards, slices, recursive descent, and filter expressions. Live in-browser evaluation.',
  alternates: {
    canonical: '/tools/jsonpath-tester',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/jsonpath-tester',
    title: 'JSONPath Query Engine',
    description: 'Query JSON with JSONPath — supported syntax: dot access, wildcards, slices, recursive descent, filters.',
    images: [{ url: '/og/tools/jsonpath-tester.png', width: 1200, height: 630, alt: 'JSONPath Query Engine tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/jsonpath-tester.png'],
  },
};

export default function JsonPathTesterPage() {
  return <JsonPathTester />;
}