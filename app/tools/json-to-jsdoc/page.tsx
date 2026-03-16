import type { Metadata } from 'next';
import JsonToJsDoc from '../../../components/tools/JsonToJsDoc/JsonToJsDoc';

export const metadata: Metadata = {
    title: 'JSON to JSDoc - Convert JSON to JSDoc Type Definitions',
    description: 'Free JSON to JSDoc converter with syntax highlighting. Generate JSDoc @typedef comments from JSON objects for JavaScript type hints. Supports optional field detection.',
    keywords: 'json to jsdoc, jsdoc typedef generator, javascript types, json converter, jsdoc types, type hints, javascript documentation, how to document javascript with jsdoc, convert json to jsdoc, generate jsdoc from json, javascript type hints',
    openGraph: {
        url: 'https://developers.do/tools/json-to-jsdoc',
        title: 'JSON to JSDoc - Free Type Definition Generator with Syntax Highlighting',
        description: 'Convert JSON to JSDoc typedefs instantly. Get JavaScript type hints without TypeScript. Free JSON to JSDoc converter.',
        images: [{ url: 'https://developers.do/favicon.png' }],
    },
};

export default function JsonToJsDocPage() {
    return <JsonToJsDoc />;
}
