import type { Metadata } from 'next';
import ColorPicker from '../../../components/tools/ColorPicker/ColorPicker';

export const metadata: Metadata = {
  title: 'Color Picker - HEX, RGB, HSL, HSV, CMYK Converter',
  description: 'Free color picker tool to select colors and convert between HEX, RGB, HSL, HSV, and CMYK formats. Perfect for designers and developers.',
  alternates: {
    canonical: '/tools/color-picker',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/color-picker',
    title: 'Color Picker - Free Color Converter Tool',
    description: 'Pick colors and convert between HEX, RGB, HSL, HSV, and CMYK formats instantly.',
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
