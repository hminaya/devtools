import type { Metadata } from 'next';
import CronGenerator from '../../../components/tools/CronGenerator/CronGenerator';

export const metadata: Metadata = {
  title: 'Cron Expression Generator — Build Cron Schedules Visually | DevTools',
  description: 'Generate cron expressions visually with per-field controls. Pick mode (every / every N / specific values / range) for each field — no cron syntax knowledge required. Live plain-English description and timezone-aware next-run preview.',
  alternates: {
    canonical: '/tools/cron-generator',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/cron-generator',
    title: 'Cron Expression Generator — Build Cron Schedules Visually | DevTools',
    description: 'Build cron expressions with field-level controls. No syntax knowledge required.',
    images: [{ url: '/og/tools/cron-generator.png', width: 1200, height: 630, alt: 'Cron Expression Generator tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/cron-generator.png'],
  },
};

export default function CronGeneratorPage() {
  return <CronGenerator />;
}
