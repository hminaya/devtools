import type { Metadata } from 'next';
import UnixTimestamp from '../../../components/tools/UnixTimestamp/UnixTimestamp';

export const metadata: Metadata = {
  title: 'Unix Timestamp Converter - Epoch to Date | DevTools',
  description: 'Convert Unix epoch timestamps to human-readable dates and vice versa. Single or batch conversion with seconds, milliseconds, and timezone support.',
  alternates: {
    canonical: '/tools/unix-timestamp',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/unix-timestamp',
    title: 'Unix Timestamp Converter - Epoch to Date | DevTools',
    description: 'Convert Unix epoch timestamps to human-readable dates — single or batch — with seconds, milliseconds, and multiple timezones.',
    images: [{ url: '/og/tools/unix-timestamp.png', width: 1200, height: 630, alt: 'Unix Timestamp Converter tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/unix-timestamp.png'],
  },
};

export default function UnixTimestampPage() {
  return <UnixTimestamp />;
}