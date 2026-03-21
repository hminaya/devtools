import type { Metadata } from 'next';
import HttpStatusCodes from '../../../components/tools/HttpStatusCodes/HttpStatusCodes';

export const metadata: Metadata = {
  title: 'HTTP Status Code Reference - All HTTP Codes Explained | DevTools',
  description: 'Complete searchable reference for all HTTP status codes (1xx–5xx) with descriptions, use cases, and examples. Filter by category or search by code number.',
  keywords: 'http status codes, http 404, http 200, http 500, http 401, http 403, status code reference, rest api status codes',
  openGraph: {
    url: 'https://developers.do/tools/http-status-codes',
    title: 'HTTP Status Code Reference - All HTTP Codes Explained | DevTools',
    description: 'Complete searchable reference for all HTTP status codes (1xx–5xx) with descriptions and use cases.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function HttpStatusCodesPage() {
  return <HttpStatusCodes />;
}
