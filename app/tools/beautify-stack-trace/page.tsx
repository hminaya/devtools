import type { Metadata } from 'next';
import StacktraceFormatter from '../../../components/tools/StacktraceFormatter/StacktraceFormatter';

export const metadata: Metadata = {
  title: 'Beautify Stack Trace - Format & Clean Up Error Traces Online',
  description: 'Free online stack trace beautifier. Paste messy error traces and get clean, syntax-highlighted, readable output. Supports JavaScript, Python, Java, C#, Go, PHP, and Ruby. Runs in your browser.',
  keywords: 'beautify stack trace, stack trace beautifier, clean up stack trace, beautify exception output, format error trace, pretty print stack trace, readable stack trace, stack trace cleaner, error log beautifier, make stack trace readable',
  openGraph: {
    url: 'https://developers.do/tools/beautify-stack-trace',
    title: 'Beautify Stack Trace - Free Online Stack Trace Beautifier',
    description: 'Paste messy error traces and get clean, syntax-highlighted, readable output. Auto-detects language and highlights key information.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function BeautifyStackTracePage() {
  return <StacktraceFormatter />;
}
