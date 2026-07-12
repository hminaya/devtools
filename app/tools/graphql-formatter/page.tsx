import type { Metadata } from 'next';
import GraphQLFormatter from '../../../components/tools/GraphQLFormatter/GraphQLFormatter';

export const metadata: Metadata = {
  title: 'GraphQL Formatter - Format and Validate GraphQL Queries',
  description: 'Format and validate GraphQL queries, mutations, subscriptions, and fragments. Preserves string literals, handles args, blocks, lists, comments, and descriptions. Live in-browser.',
  alternates: {
    canonical: '/tools/graphql-formatter',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/graphql-formatter',
    title: 'GraphQL Formatter',
    description: 'Format and validate GraphQL queries, mutations, and fragments with live in-browser formatting.',
    images: [{ url: '/og/tools/graphql-formatter.png', width: 1200, height: 630, alt: 'GraphQL Formatter tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/graphql-formatter.png'],
  },
};

export default function GraphQLFormatterPage() {
  return <GraphQLFormatter />;
}