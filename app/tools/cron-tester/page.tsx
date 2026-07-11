import type { Metadata } from 'next';
import CronTester from '../../../components/tools/CronTester/CronTester';

export const metadata: Metadata = {
  title: 'Cron Expression Tester, Parser & Explainer | DevTools',
  description: 'Test and parse cron expressions. See them explained in plain English and preview upcoming run times in any timezone. Supports standard 5-field syntax and macros like @daily and @hourly.',
  alternates: {
    canonical: '/tools/cron-tester',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/cron-tester',
    title: 'Cron Expression Tester, Parser & Explainer | DevTools',
    description: 'Test cron expressions, explain them in plain English, and preview upcoming run times across timezones.',
    images: [{ url: '/og/tools/cron-tester.png', width: 1200, height: 630, alt: 'Cron Expression Tester tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/cron-tester.png'],
  },
};

export default function CronTesterPage() {
  return <CronTester />;
}
