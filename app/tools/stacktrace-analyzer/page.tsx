import type { Metadata } from 'next';
import StacktraceAnalyzer from '../../../components/tools/StacktraceAnalyzer/StacktraceAnalyzer';

export const metadata: Metadata = {
  title: 'Stack Trace Analyzer - Identify Root Causes & Explain Errors',
  description: 'Free online stack trace analyzer for JavaScript, Python, Java, C#, Go, PHP, and Ruby. Identifies root cause frames, explains error types, suggests fixes, and separates application code from framework internals.',
  alternates: {
    canonical: '/tools/stacktrace-analyzer',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/stacktrace-analyzer',
    title: 'Stack Trace Analyzer - Root Cause & Error Explanation Tool',
    description: 'Analyze stack traces to identify root causes, understand error types, and get suggested fixes. Supports JavaScript, Python, Java, C#, Go, PHP, and Ruby.',
    images: [{ url: '/og/tools/stacktrace-analyzer.png', width: 1200, height: 630, alt: 'Developer Tools Dashboard' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/stacktrace-analyzer.png'],
  },
};

export default function StacktraceAnalyzerPage() {
  return <StacktraceAnalyzer />;
}
