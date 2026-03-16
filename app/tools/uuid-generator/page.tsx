import type { Metadata } from 'next';
import UuidGenerator from '../../../components/tools/UuidGenerator/UuidGenerator';

export const metadata: Metadata = {
  title: 'UUID Generator - Generate Random UUIDs (v4)',
  description: 'Free UUID generator for creating version 4 (random) UUIDs. Generate single or multiple UUIDs instantly. Perfect for database primary keys, unique identifiers, and API development.',
  keywords: 'uuid generator, uuid v4, generate uuid, random uuid, unique identifier, guid generator, uuid tool, create uuid, how to generate a uuid, create unique id online, what is a uuid, uuid v4 online, guid generator online',
  openGraph: {
    url: 'https://developers.do/tools/uuid-generator',
    title: 'UUID Generator - Free Random UUID (v4) Generator',
    description: 'Generate random version 4 UUIDs instantly. Free UUID generator tool for creating unique identifiers.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function UuidGeneratorPage() {
  return <UuidGenerator />;
}
