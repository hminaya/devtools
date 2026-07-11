import type { Metadata } from 'next';
import PasswordGenerator from '../../../components/tools/PasswordGenerator/PasswordGenerator';

export const metadata: Metadata = {
  title: 'Password Generator - Secure Random Passwords & Passphrases',
  description: 'Free secure password and passphrase generator with strength meter. Create strong random passwords or memorable passphrases with entropy calculation and crack time estimates. Runs entirely in your browser.',
  alternates: {
    canonical: '/tools/password-generator',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/password-generator',
    title: 'Password & Passphrase Generator - Free with Strength Meter',
    description: 'Generate strong random passwords or memorable passphrases. Includes entropy calculation and crack time estimates. Free and runs in your browser.',
    images: [{ url: '/og/tools/password-generator.png', width: 1200, height: 630, alt: 'Password Generator tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/password-generator.png'],
  },
};

export default function PasswordGeneratorPage() {
  return <PasswordGenerator />;
}
