import type { Metadata } from 'next';
import ClawdbotSecurityScanner from '../../../components/tools/ClawdbotSecurityScanner/ClawdbotSecurityScanner';

export const metadata: Metadata = {
  title: 'Clawdbot Security Scanner - Audit AI Agent Configurations',
  description:
    'Scan Clawdbot, Moltbot, and OpenClaw configurations for security vulnerabilities. Detect exposed APIs, insecure permissions, prompt injection risks, and more. Free, private, browser-based security audit.',
  keywords:
    'clawdbot security, moltbot audit, openclaw security, ai agent security, configuration scanner, prompt injection, mcp security, shell access audit',
  openGraph: {
    url: 'https://developers.do/tools/clawdbot-security-scanner',
    title: 'Clawdbot Security Scanner - Free AI Agent Configuration Audit',
    description:
      'Audit your Clawdbot/Moltbot/OpenClaw configuration for security issues. Detects gateway exposure, shell access risks, credential leaks, and prompt injection vulnerabilities.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function ClawdbotSecurityScannerPage() {
  return <ClawdbotSecurityScanner />;
}
