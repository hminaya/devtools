import type { Metadata } from 'next';
import JsonSchemaValidator from '../../../components/tools/JsonSchemaValidator/JsonSchemaValidator';

export const metadata: Metadata = {
  title: 'JSON Schema Validator & Generator - Draft 2020-12 and Draft-07',
  description:
    'Generate a JSON Schema from JSON and validate JSON against a schema. Supports draft 2020-12 and draft-07, multiple samples for optional-field detection, and additionalProperties control. 100% client-side.',
  alternates: {
    canonical: '/tools/json-schema-validator',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/json-schema-validator',
    title: 'JSON Schema Validator & Generator - Draft 2020-12 / Draft-07',
    description:
      'Infer a JSON Schema from JSON and validate JSON against a schema. Supports multiple samples, optional-field detection, and draft 2020-12 / draft-07. Free, client-side, no backend.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'JSON Schema Validator & Generator tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.png'],
  },
};

export default function JsonSchemaValidatorPage() {
  return <JsonSchemaValidator />;
}