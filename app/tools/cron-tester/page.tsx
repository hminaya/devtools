import type { Metadata } from 'next';
import CronTester from '../../../components/tools/CronTester/CronTester';

export const metadata: Metadata = {
  title: 'Cron Expression Tester, Parser & Explainer | DevTools',
  description: 'Test and parse cron expressions. See them explained in plain English and preview upcoming run times in any timezone. Supports standard 5-field syntax and macros like @daily and @hourly.',
  keywords: 'cron tester, cron parser, cron expression tester, cron expression parser, cron explainer, cron schedule tester, cron next run, crontab tester, crontab guru',
  alternates: {
    canonical: '/tools/cron-tester',
  },
  openGraph: {
    url: 'https://developers.do/tools/cron-tester',
    title: 'Cron Expression Tester, Parser & Explainer | DevTools',
    description: 'Test cron expressions, explain them in plain English, and preview upcoming run times across timezones.',
    images: [{ url: '/og/tools/cron-tester.png', width: 1200, height: 630, alt: 'Developer Tools Dashboard' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/cron-tester.png'],
  },
};

export default function CronTesterPage() {
  return <CronTester />;
}
