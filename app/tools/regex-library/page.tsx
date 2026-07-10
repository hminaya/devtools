import type { Metadata } from 'next';
import RegexLibrary from '../../../components/tools/RegexLibrary/RegexLibrary';

export const metadata: Metadata = {
  title: 'Regex Library - Common Regular Expressions | DevTools',
  description: 'Browse and copy common regular expressions for email, URL, IP, date, password validation, and more. Searchable and filterable by category.',
  alternates: {
    canonical: '/tools/regex-library',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/regex-library',
    title: 'Regex Library - Common Regular Expressions | DevTools',
    description: 'Browse and copy common regular expressions for email, URL, IP, date, password validation, and more.',
    images: [{ url: '/og/tools/regex-library.png', width: 1200, height: 630, alt: 'Developer Tools Dashboard' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/regex-library.png'],
  },
};

export default function RegexLibraryPage() {
  return <RegexLibrary />;
}
