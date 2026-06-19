import type { Metadata } from 'next';
import UnixTimestamp from '../../../components/tools/UnixTimestamp/UnixTimestamp';

export const metadata: Metadata = {
  title: 'Unix Timestamp Converter - Epoch to Date | DevTools',
  description: 'Convert Unix epoch timestamps to human-readable dates and vice versa. Supports seconds and milliseconds with timezone conversion.',
  keywords: 'unix timestamp, epoch converter, epoch to date, timestamp to date, unix time, epoch time, utc converter',
  alternates: {
    canonical: '/tools/unix-timestamp',
  },
  openGraph: {
    url: 'https://developers.do/tools/unix-timestamp',
    title: 'Unix Timestamp Converter - Epoch to Date | DevTools',
    description: 'Convert Unix epoch timestamps to human-readable dates. Supports seconds, milliseconds, and multiple timezones.',
    images: [{ url: '/og/tools/unix-timestamp.png', width: 1200, height: 630, alt: 'Developer Tools Dashboard' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/unix-timestamp.png'],
  },
};

export default function UnixTimestampPage() {
  return <UnixTimestamp />;
}
