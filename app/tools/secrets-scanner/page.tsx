import type { Metadata } from 'next';
import SecretsScanner from '../../../components/tools/SecretsScanner/SecretsScanner';

export const metadata: Metadata = {
  title: 'Secrets Scanner - Client-Side Secret Detection for Logs & Configs',
  description:
    'Scan for leaked API keys, tokens, and private keys directly in your browser. No backend, no data collection. Paste env files, logs, or configs to detect secrets instantly.',
  alternates: {
    canonical: '/tools/secrets-scanner',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/secrets-scanner',
    title: 'Secrets Scanner - Browser-Only Secret Detection',
    description:
      'Find leaked API keys, tokens, and private keys in logs or configs without sending data to a server. Runs locally in your browser.',
    images: [{ url: '/og/tools/secrets-scanner.png', width: 1200, height: 630, alt: 'Developer Tools Dashboard' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/secrets-scanner.png'],
  },
};

export default function SecretsScannerPage() {
  return <SecretsScanner />;
}
