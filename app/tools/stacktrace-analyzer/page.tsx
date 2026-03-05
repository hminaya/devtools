import type { Metadata } from 'next';
import StacktraceAnalyzer from '../../../components/tools/StacktraceAnalyzer/StacktraceAnalyzer';

export const metadata: Metadata = {
  title: 'Stack Trace Analyzer - Identify Root Causes & Explain Errors',
  description: 'Free online stack trace analyzer for JavaScript, Python, Java, C#, Go, PHP, and Ruby. Identifies root cause frames, explains error types, suggests fixes, and separates application code from framework internals.',
  keywords: 'stack trace analyzer, error analyzer, root cause analysis, debug stack trace, error explainer, javascript error, python traceback, java exception, stack trace debugger',
  openGraph: {
    url: 'https://developers.do/tools/stacktrace-analyzer',
    title: 'Stack Trace Analyzer - Root Cause & Error Explanation Tool',
    description: 'Analyze stack traces to identify root causes, understand error types, and get suggested fixes. Supports JavaScript, Python, Java, C#, Go, PHP, and Ruby.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function StacktraceAnalyzerPage() {
  return <StacktraceAnalyzer />;
}
