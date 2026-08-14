import type { Metadata } from 'next';
import HttpStatusCodes from '../../../components/tools/HttpStatusCodes/HttpStatusCodes';

export const metadata: Metadata = {
  title: 'HTTP Status Codes - Complete Searchable Reference (1xx–5xx)',
  description: 'Searchable reference of every HTTP status code (1xx–5xx): descriptions, use cases, and debugging tips. Filter by class or search by code. Free, no signup.',
  alternates: {
    canonical: '/tools/http-status-codes',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/http-status-codes',
    title: 'HTTP Status Code Reference - All HTTP Codes Explained | DevTools',
    description: 'Complete searchable reference for all HTTP status codes (1xx–5xx) with descriptions and use cases.',
    images: [{ url: '/og/tools/http-status-codes.png', width: 1200, height: 630, alt: 'HTTP Status Code Reference tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/http-status-codes.png'],
  },
};

export default function HttpStatusCodesPage() {
  return <HttpStatusCodes />;
}
