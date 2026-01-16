import type { Metadata } from 'next';
import TextExtractor from '../../../components/tools/TextExtractor/TextExtractor';

export const metadata: Metadata = {
  title: 'Text Extractor - Extract Emails, URLs, IPs & More from Text',
  description: 'Free text extraction tool. Extract emails, URLs, IP addresses, phone numbers, dates, UUIDs, and more from any text using regex patterns. No AI model required - instant results.',
  keywords: 'text extractor, extract emails, extract urls, extract ip addresses, regex extraction, data extraction, parse text, extract phone numbers, extract dates, developer tools',
  openGraph: {
    url: 'https://developers.do/tools/text-extractor',
    title: 'Text Extractor - Extract Emails, URLs, IPs & More',
    description: 'Extract structured data from text instantly. Find emails, URLs, IPs, phone numbers, dates, UUIDs, and 10+ other patterns. Free, private, no downloads.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function TextExtractorPage() {
  return <TextExtractor />;
}
