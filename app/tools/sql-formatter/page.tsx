import type { Metadata } from 'next';
import SqlFormatter from '../../../components/tools/SqlFormatter/SqlFormatter';

export const metadata: Metadata = {
  title: 'SQL Formatter - Format and Beautify SQL Queries Online | DevTools',
  description: 'Format, beautify, and minify SQL queries online. Supports MySQL, PostgreSQL, SQLite, T-SQL, PL/SQL, and generic SQL with keyword case and indent options.',
  alternates: {
    canonical: '/tools/sql-formatter',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/sql-formatter',
    title: 'SQL Formatter - Format and Beautify SQL Queries Online | DevTools',
    description: 'Format and beautify SQL queries online. Supports MySQL, PostgreSQL, SQLite, T-SQL, and more.',
    images: [{ url: '/og/tools/sql-formatter.png', width: 1200, height: 630, alt: 'SQL Formatter tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/sql-formatter.png'],
  },
};

export default function SqlFormatterPage() {
  return <SqlFormatter />;
}
