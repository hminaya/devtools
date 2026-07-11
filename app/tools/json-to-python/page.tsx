import type { Metadata } from 'next';
import JsonToPython from '../../../components/tools/JsonToPython/JsonToPython';

export const metadata: Metadata = {
  title: 'JSON to Python Converter - Generate Dataclasses & Pydantic Models',
  description: 'Free JSON to Python converter. Transform JSON objects into Python dataclasses or Pydantic BaseModel classes with optional field detection. Perfect for API development and data validation.',
  alternates: {
    canonical: '/tools/json-to-python',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/json-to-python',
    title: 'JSON to Python - Free Dataclass & Pydantic Generator',
    description: 'Convert JSON to Python dataclasses or Pydantic models instantly with optional field detection.',
    images: [{ url: '/og/tools/json-to-python.png', width: 1200, height: 630, alt: 'JSON to Python tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/json-to-python.png'],
  },
};

export default function JsonToPythonPage() {
  return <JsonToPython />;
}
