import type { Metadata } from 'next';
import SVGPathVisualizer from '../../../components/tools/SVGPathVisualizer/SVGPathVisualizer';

export const metadata: Metadata = {
  title: 'SVG Path Visualizer - Render and Debug SVG path d Attribute',
  description: 'Paste an SVG path\'s d attribute and see it rendered instantly. Includes presets (curve, star, arc, bezier), adjustable stroke/fill colors, viewBox size, and an optional grid overlay.',
  alternates: {
    canonical: '/tools/svg-path-visualizer',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/svg-path-visualizer',
    title: 'SVG Path Visualizer',
    description: 'Render SVG path d attributes with adjustable colors and presets.',
    images: [{ url: '/og/tools/svg-path-visualizer.png', width: 1200, height: 630, alt: 'SVG Path Visualizer tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/svg-path-visualizer.png'],
  },
};

export default function SVGPathVisualizerPage() {
  return <SVGPathVisualizer />;
}