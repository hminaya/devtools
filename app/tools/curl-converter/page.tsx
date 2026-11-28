import type { Metadata } from 'next';
import CurlConverter from '../../../components/tools/CurlConverter/CurlConverter';

export const metadata: Metadata = {
  title: 'cURL Converter & Parser — cURL to Fetch, Python, Go & Rust',
  description:
    'Parse cURL commands locally in your browser and convert them to JavaScript fetch, TypeScript, Axios, Python requests/httpx, Go net/http, Rust reqwest, or formatted cURL. 100% client-side with secret redaction.',
  alternates: {
    canonical: '/tools/curl-converter',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/curl-converter',
    title: 'cURL Converter & Parser — cURL to Fetch, Python, Go & Rust',
    description:
      'Convert cURL commands to fetch, axios, Python, Go, Rust, or formatted cURL and inspect headers, params, cookies, and payloads. 100% local only.',
    images: [{ url: '/og/tools/curl-converter.png', width: 1200, height: 630, alt: 'cURL Converter & Parser tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/curl-converter.png'],
  },
};

export default function CurlConverterPage() {
  return <CurlConverter />;
}
