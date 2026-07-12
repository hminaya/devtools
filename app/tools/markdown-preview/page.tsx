import type { Metadata } from 'next';
import MarkdownPreview from '../../../components/tools/MarkdownPreview/MarkdownPreview';

export const metadata: Metadata = {
  title: 'Markdown Live Preview - Write & Render Markdown Online',
  description: 'Write Markdown on the left, see the rendered HTML preview on the right. Supports headings, bold, italic, inline code, code fences, lists, quotes, links, autolinks, and GFM strikethrough. Escapes inline HTML for safety.',
  alternates: {
    canonical: '/tools/markdown-preview',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/markdown-preview',
    title: 'Markdown Live Preview',
    description: 'Write Markdown, see live HTML preview — CommonMark subset plus GFM strikethrough.',
    images: [{ url: '/og/tools/markdown-preview.png', width: 1200, height: 630, alt: 'Markdown Preview tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/markdown-preview.png'],
  },
};

export default function MarkdownPreviewPage() {
  return <MarkdownPreview />;
}