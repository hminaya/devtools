import type { Metadata } from 'next';
import StacktraceFormatter from '../../../components/tools/StacktraceFormatter/StacktraceFormatter';

export const metadata: Metadata = {
  title: 'Stacktrace Formatter - Format & Beautify Stack Traces',
  description: 'Free online stack trace formatter supporting JavaScript, Python, Java, C#, Go, PHP, and Ruby. Format stack traces, remove sensitive data, and improve readability. Runs entirely in your browser.',
  keywords: 'stacktrace formatter, stack trace beautifier, debug logs, error log formatter, javascript stacktrace, python traceback, java stack trace, c# stack trace, anonymize logs, how to read a stack trace, format error log online, clean up stack trace, beautify exception output',
  openGraph: {
    url: 'https://developers.do/tools/stacktrace-formatter',
    title: 'Stacktrace Formatter - Free Online Stack Trace Beautifier',
    description: 'Format and beautify stack traces from multiple programming languages. Auto-detects language, removes sensitive data, and highlights key information.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function StacktraceFormatterPage() {
  return <StacktraceFormatter />;
}
