import type { Metadata } from 'next';
import RegexLibrary from '../../../components/tools/RegexLibrary/RegexLibrary';

export const metadata: Metadata = {
  title: 'Regex Library - Common Regular Expressions | DevTools',
  description: 'Browse and copy common regular expressions for email, URL, IP, date, password validation, and more. Searchable and filterable by category.',
  keywords: 'regex, regular expression, regex library, email regex, url regex, password regex, validation patterns, regex cheatsheet',
  openGraph: {
    url: 'https://developers.do/tools/regex-library',
    title: 'Regex Library - Common Regular Expressions | DevTools',
    description: 'Browse and copy common regular expressions for email, URL, IP, date, password validation, and more.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function RegexLibraryPage() {
  return <RegexLibrary />;
}
