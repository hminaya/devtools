import type { Metadata } from 'next';
import StacktraceFormatter from '../../../components/tools/StacktraceFormatter/StacktraceFormatter';

export const metadata: Metadata = {
  title: 'Stack Trace Formatter - Free Online Beautifier (No Upload)',
  description: 'Clean up, format, and beautify messy JavaScript, Python, Java, C#, Go, PHP & Ruby stack traces from logs, CI, or terminals. Free, private, no upload.',
  alternates: {
    canonical: '/tools/stacktrace-formatter',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/stacktrace-formatter',
    title: 'Stack Trace Formatter - Free Online Stack Trace Beautifier',
    description: 'Clean up and format messy stack traces from logs, CI, and terminals. Supports JavaScript, Python, Java, C#, Go, PHP, and Ruby.',
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
