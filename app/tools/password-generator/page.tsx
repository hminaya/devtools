import type { Metadata } from 'next';
import PasswordGenerator from '../../../components/tools/PasswordGenerator/PasswordGenerator';

export const metadata: Metadata = {
  title: 'Password Generator - Create Secure Random Passwords',
  description: 'Free secure password generator. Create strong random passwords with customizable length, uppercase, lowercase, numbers, and special characters. Generate multiple passwords instantly.',
  keywords: 'password generator, secure password, random password, strong password generator, password creator, generate password, secure password tool, how to create a strong password, generate secure password online, random password maker, what makes a password secure',
  openGraph: {
    url: 'https://developers.do/tools/password-generator',
    title: 'Password Generator - Free Secure Random Password Creator',
    description: 'Generate strong, secure random passwords with custom settings. Free password generator with uppercase, lowercase, numbers, and special characters.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function PasswordGeneratorPage() {
  return <PasswordGenerator />;
}
