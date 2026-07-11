import type { Metadata } from 'next';
import ClawdbotSecurityScanner from '../../../components/tools/ClawdbotSecurityScanner/ClawdbotSecurityScanner';

export const metadata: Metadata = {
  title: 'Clawdbot Security Scanner - Audit AI Agent Configurations',
  description:
    'Scan Clawdbot, Moltbot, and OpenClaw configurations for security vulnerabilities. Detect exposed APIs, insecure permissions, prompt injection risks, and more. Free, private, browser-based security audit.',
  alternates: {
    canonical: '/tools/clawdbot-security-scanner',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/clawdbot-security-scanner',
    title: 'Clawdbot Security Scanner - Free AI Agent Configuration Audit',
    description:
      'Audit your Clawdbot/Moltbot/OpenClaw configuration for security issues. Detects gateway exposure, shell access risks, credential leaks, and prompt injection vulnerabilities.',
    images: [{ url: '/og/tools/clawdbot-security-scanner.png', width: 1200, height: 630, alt: 'Clawdbot Security Scanner tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/clawdbot-security-scanner.png'],
  },
};

export default function ClawdbotSecurityScannerPage() {
  return <ClawdbotSecurityScanner />;
}
