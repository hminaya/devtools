import type { Metadata } from 'next';
import SqlFormatter from '../../../components/tools/SqlFormatter/SqlFormatter';

export const metadata: Metadata = {
  title: 'SQL Formatter - Format and Beautify SQL Queries Online | DevTools',
  description: 'Format, beautify, and minify SQL queries online. Supports MySQL, PostgreSQL, SQLite, T-SQL, PL/SQL, and generic SQL with keyword case and indent options.',
  keywords: 'sql formatter, sql beautifier, sql prettifier, format sql online, mysql formatter, postgresql formatter, sql minifier, sql query formatter',
  openGraph: {
    url: 'https://developers.do/tools/sql-formatter',
    title: 'SQL Formatter - Format and Beautify SQL Queries Online | DevTools',
    description: 'Format and beautify SQL queries online. Supports MySQL, PostgreSQL, SQLite, T-SQL, and more.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function SqlFormatterPage() {
  return <SqlFormatter />;
}
