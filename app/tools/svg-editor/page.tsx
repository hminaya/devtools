import type { Metadata } from 'next';
import SVGEditor from '../../../components/tools/SVGEditor/SVGEditor';

export const metadata: Metadata = {
  title: 'SVG Editor - Live SVG Code & Preview',
  description: 'Edit SVG markup on the left and see the rendered preview update instantly on the right. Strips scripts and event-handler attributes for browser-safety.',
  alternates: {
    canonical: '/tools/svg-editor',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/svg-editor',
    title: 'SVG Editor — Live Code & Preview',
    description: 'Edit SVG with live rendered preview in your browser.',
    images: [{ url: '/og/tools/svg-editor.png', width: 1200, height: 630, alt: 'SVG Editor tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/svg-editor.png'],
  },
};

export default function SVGEditorPage() {
  return <SVGEditor />;
}