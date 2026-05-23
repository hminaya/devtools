import type { Metadata } from 'next';
import CsvJsonConverter from '../../../components/tools/CsvJsonConverter/CsvJsonConverter';

export const metadata: Metadata = {
  title: 'CSV to JSON Converter - JSON to CSV Online | DevTools',
  description:
    'Convert CSV to JSON and JSON to CSV online with auto-detection, delimiter handling, type inference, and nested-object flattening. All processing happens in your browser.',
  keywords:
    'csv to json, json to csv, csv converter, csv json converter, convert csv, csv parser online, tsv to json, flatten json to csv',
  openGraph: {
    url: 'https://developers.do/tools/csv-json-converter',
    title: 'CSV to JSON Converter - JSON to CSV Online | DevTools',
    description:
      'Convert between CSV and JSON online with auto-detection, delimiter handling, and type inference. Supports any CSV or JSON data.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function CsvJsonConverterPage() {
  return <CsvJsonConverter />;
}
