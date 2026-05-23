import type { Metadata } from 'next';
import CsvViewer from '../../../components/tools/CsvViewer/CsvViewer';

export const metadata: Metadata = {
  title: 'CSV Viewer - Online Table Explorer | DevTools',
  description:
    'Paste CSV and explore it as a sortable, searchable table with sticky headers — no spreadsheet needed. Auto-detects delimiters. All processing happens in your browser.',
  keywords:
    'csv viewer, csv table viewer, view csv online, csv explorer, sort csv, search csv, csv reader, open csv online, tsv viewer',
  openGraph: {
    url: 'https://developers.do/tools/csv-viewer',
    title: 'CSV Viewer - Online Table Explorer | DevTools',
    description:
      'View CSV as a sortable, searchable table online. Auto-detects delimiters, sticky headers, type-aware sorting.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function CsvViewerPage() {
  return <CsvViewer />;
}
