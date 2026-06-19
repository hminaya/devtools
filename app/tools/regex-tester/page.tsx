import type { Metadata } from 'next';
import RegexTester from '../../../components/tools/RegexTester/RegexTester';

export const metadata: Metadata = {
  title: 'Regex Tester - Test Regular Expressions Online | DevTools',
  description:
    'Test and debug regular expressions online. See match highlights, capture groups, and replacement results instantly.',
  keywords:
    'regex, regular expression, regex tester, regex matcher, regex debugger, regex online, test regex, javascript regex, regex capture groups, regex replace',
  alternates: {
    canonical: '/tools/regex-tester',
  },
  openGraph: {
    url: 'https://developers.do/tools/regex-tester',
    title: 'Regex Tester - Test Regular Expressions Online | DevTools',
    description: 'Test and debug regular expressions online. See match highlights, capture groups, and replacement results instantly.',
    images: [{ url: '/og/tools/regex-tester.png', width: 1200, height: 630, alt: 'Developer Tools Dashboard' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/regex-tester.png'],
  },
};

export default function RegexTesterPage() {
  return <RegexTester />;
}
