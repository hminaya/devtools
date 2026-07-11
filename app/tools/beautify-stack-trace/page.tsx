import type { Metadata } from 'next';
import StacktraceFormatter from '../../../components/tools/StacktraceFormatter/StacktraceFormatter';

export const metadata: Metadata = {
  title: 'Beautify Stack Trace - Format & Clean Up Error Traces Online',
  description: 'Free online stack trace beautifier. Paste messy error traces and get clean, syntax-highlighted, readable output. Supports JavaScript, Python, Java, C#, Go, PHP, and Ruby. Runs in your browser.',
  alternates: {
    canonical: '/tools/beautify-stack-trace',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/beautify-stack-trace',
    title: 'Beautify Stack Trace - Free Online Stack Trace Beautifier',
    description: 'Paste messy error traces and get clean, syntax-highlighted, readable output. Auto-detects language and highlights key information.',
    images: [{ url: '/og/tools/beautify-stack-trace.png', width: 1200, height: 630, alt: 'Beautify Stack Trace tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/beautify-stack-trace.png'],
  },
};

export default function BeautifyStackTracePage() {
  return <StacktraceFormatter />;
}
