import type { Metadata } from 'next';
import SecretsScanner from '../../../components/tools/SecretsScanner/SecretsScanner';

export const metadata: Metadata = {
  title: 'Secrets Scanner - Client-Side Secret Detection for Logs & Configs',
  description:
    'Scan for leaked API keys, tokens, and private keys directly in your browser. No backend, no data collection. Paste env files, logs, or configs to detect secrets instantly.',
  keywords:
    'secrets scanner, detect secrets, api key leak, token leak, secret detection tool, client side secrets scan, offline secret scanner, credentials leak, env file scanner, log scanner, how to find leaked api keys, detect exposed credentials in logs, scan env file for secrets, check for api key exposure',
  openGraph: {
    url: 'https://developers.do/tools/secrets-scanner',
    title: 'Secrets Scanner - Browser-Only Secret Detection',
    description:
      'Find leaked API keys, tokens, and private keys in logs or configs without sending data to a server. Runs locally in your browser.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function SecretsScannerPage() {
  return <SecretsScanner />;
}
