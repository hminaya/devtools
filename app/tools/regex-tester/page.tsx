import type { Metadata } from 'next';
import RegexTester from '../../../components/tools/RegexTester/RegexTester';

export const metadata: Metadata = {
  title: 'Regex Tester - Test Regular Expressions Online | DevTools',
  description:
    'Test and debug regular expressions online. See match highlights, capture groups, and replacement results instantly.',
  keywords:
    'regex, regular expression, regex tester, regex matcher, regex debugger, regex online, test regex, javascript regex, regex capture groups, regex replace',
  openGraph: {
    url: 'https://developers.do/tools/regex-tester',
    title: 'Regex Tester - Test Regular Expressions Online | DevTools',
    description: 'Test and debug regular expressions online. See match highlights, capture groups, and replacement results instantly.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function RegexTesterPage() {
  return <RegexTester />;
}
