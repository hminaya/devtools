import type { Metadata } from 'next';
import StacktraceFormatter from '../../../components/tools/StacktraceFormatter/StacktraceFormatter';

export const metadata: Metadata = {
  title: 'Stack Trace Formatter - Free Online Beautifier (No Upload)',
  description: 'Format JavaScript, Python, Java, C#, Go, PHP & Ruby stack traces into clean, highlighted output. Auto-detects language. Free, no upload or signup.',
  alternates: {
    canonical: '/tools/stacktrace-formatter',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/stacktrace-formatter',
    title: 'Stack Trace Formatter - Free Online Stack Trace Beautifier',
    description: 'Format messy stack traces from JavaScript, Python, Java, C#, Go, PHP, and Ruby. Auto-detects language and can remove sensitive data.',
    images: [{ url: '/og/tools/stacktrace-formatter.png', width: 1200, height: 630, alt: 'Stack Trace Formatter tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/stacktrace-formatter.png'],
  },
};

export default function StacktraceFormatterPage() {
  return <StacktraceFormatter />;
}
