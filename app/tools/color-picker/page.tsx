import type { Metadata } from 'next';
import ColorPicker from '../../../components/tools/ColorPicker/ColorPicker';

export const metadata: Metadata = {
  title: 'Color Picker - HEX, RGB, HSL, HSV, CMYK & Tailwind Palettes',
  description: 'Free color picker tool to select colors, convert between HEX/RGB/HSL/HSV/CMYK, and browse curated palettes — Tailwind CSS v3, Nord, Solarized, Dracula, GitHub, Material, and One Dark.',
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