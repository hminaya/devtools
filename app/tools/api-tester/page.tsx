import type { Metadata } from 'next';
import ApiTester from '../../../components/tools/ApiTester/ApiTester';

export const metadata: Metadata = {
  title: 'API Tester - Test REST API Endpoints Online',
  description: 'Free online API tester for GET and POST requests. View response status, headers, and body. Generate TypeScript, C#, or Swift code from JSON responses. Perfect for API development and testing.',
  keywords: 'api tester, rest api tester, api testing tool, test api, http request, api client, online api tool, rest client, how to test an api endpoint, test rest api online free, http request tester, send get post request online',
  openGraph: {
    url: 'https://developers.do/tools/api-tester',
    title: 'API Tester - Free Online REST API Testing Tool',
    description: 'Test API endpoints and view responses. Generate TypeScript, C#, or Swift code from JSON responses. Free online API tester.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function ApiTesterPage() {
  return <ApiTester />;
}
