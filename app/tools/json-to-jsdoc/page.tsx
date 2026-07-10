import type { Metadata } from 'next';
import JsonToJsDoc from '../../../components/tools/JsonToJsDoc/JsonToJsDoc';

export const metadata: Metadata = {
    title: 'JSON to JSDoc - Convert JSON to JSDoc Type Definitions',
    description: 'Free JSON to JSDoc converter with syntax highlighting. Generate JSDoc @typedef comments from JSON objects for JavaScript type hints. Supports optional field detection.',
    alternates: {
    canonical: '/tools/json-to-jsdoc',
  },
  openGraph: {
        url: 'https://www.developers.do/tools/json-to-jsdoc',
        title: 'JSON to JSDoc - Free Type Definition Generator with Syntax Highlighting',
        description: 'Convert JSON to JSDoc typedefs instantly. Get JavaScript type hints without TypeScript. Free JSON to JSDoc converter.',
        images: [{ url: '/og/tools/json-to-jsdoc.png', width: 1200, height: 630, alt: 'Developer Tools Dashboard' }],
    },
};

export default function JsonToJsDocPage() {
    return <JsonToJsDoc />;
}
