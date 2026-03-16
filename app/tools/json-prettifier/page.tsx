import type { Metadata } from 'next';
import JsonPrettifier from '../../../components/tools/JsonPrettifier/JsonPrettifier';

export const metadata: Metadata = {
  title: 'JSON Prettifier - Format & Validate JSON',
  description: 'Free online JSON formatter with syntax highlighting. Beautify, validate, and minify JSON data instantly. Supports JSON prettifying, syntax validation, and random JSON generation. All processing happens in your browser.',
  keywords: 'json formatter, json prettifier, json validator, json beautifier, json minify, format json, validate json, json syntax highlighting, online json tool, free json formatter, how to format json, json formatter online, json beautifier free, why is my json invalid, fix json errors',
  openGraph: {
    url: 'https://developers.do/tools/json-prettifier',
    title: 'JSON Prettifier - Free Online JSON Formatter with Syntax Highlighting',
    description: 'Format, validate, and beautify JSON data with syntax highlighting. Free online JSON prettifier tool with minify and validation features.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function JsonPrettifierPage() {
  return <JsonPrettifier />;
}
