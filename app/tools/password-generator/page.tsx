import type { Metadata } from 'next';
import PasswordGenerator from '../../../components/tools/PasswordGenerator/PasswordGenerator';

export const metadata: Metadata = {
  title: 'Password Generator - Secure Random Passwords & Passphrases',
  description: 'Free secure password and passphrase generator with strength meter. Create strong random passwords or memorable passphrases with entropy calculation and crack time estimates. Runs entirely in your browser.',
  keywords: 'password generator, passphrase generator, secure password, random password, strong password generator, memorable password, password strength checker, password entropy, how strong is my password, generate passphrase online, random word password, diceware passphrase, password crack time, what makes a password secure, how to create a strong password',
  openGraph: {
    url: 'https://developers.do/tools/password-generator',
    title: 'Password & Passphrase Generator - Free with Strength Meter',
    description: 'Generate strong random passwords or memorable passphrases. Includes entropy calculation and crack time estimates. Free and runs in your browser.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function PasswordGeneratorPage() {
  return <PasswordGenerator />;
}
