import type { Metadata } from 'next';
import CsvViewer from '../../../components/tools/CsvViewer/CsvViewer';

export const metadata: Metadata = {
  title: 'CSV Viewer - Online Table Explorer | DevTools',
  description:
    'Paste CSV and explore it as a sortable, searchable table with sticky headers — no spreadsheet needed. Auto-detects delimiters. All processing happens in your browser.',
  keywords:
    'csv viewer, csv table viewer, view csv online, csv explorer, sort csv, search csv, csv reader, open csv online, tsv viewer',
  alternates: {
    canonical: '/tools/csv-viewer',
  },
  openGraph: {
    url: 'https://developers.do/tools/csv-viewer',
    title: 'CSV Viewer - Online Table Explorer | DevTools',
    description:
      'View CSV as a sortable, searchable table online. Auto-detects delimiters, sticky headers, type-aware sorting.',
    images: [{ url: '/og/tools/csv-viewer.png', width: 1200, height: 630, alt: 'Developer Tools Dashboard' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/csv-viewer.png'],
  },
};

export default function CsvViewerPage() {
  return <CsvViewer />;
}
