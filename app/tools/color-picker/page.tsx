import type { Metadata } from 'next';
import ColorPicker from '../../../components/tools/ColorPicker/ColorPicker';

export const metadata: Metadata = {
  title: 'Color Picker - Free HEX, RGB, HSL, CMYK Converter & Palettes',
  description: 'Free online color picker: paste a hex like #7c3aed or pick visually. Convert HEX/RGB/HSL/HSV/CMYK, generate harmonies, and browse Tailwind & Nord palettes.',
  alternates: {
    canonical: '/tools/color-picker',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/color-picker',
    title: 'Color Picker & Curated Palettes - Free Tool',
    description: 'Pick colors, convert formats, and copy from curated palettes (Tailwind, Nord, Solarized, Dracula, and more).',
    images: [{ url: '/og/tools/color-picker.png', width: 1200, height: 630, alt: 'Color Picker tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/color-picker.png'],
  },
};

export default function ColorPickerPage() {
  return <ColorPicker />;
}