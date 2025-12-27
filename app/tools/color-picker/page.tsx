import type { Metadata } from 'next';
import ColorPicker from '../../../components/tools/ColorPicker/ColorPicker';

export const metadata: Metadata = {
  title: 'Color Picker - HEX, RGB, HSL, HSV, CMYK Converter',
  description: 'Free color picker tool to select colors and convert between HEX, RGB, HSL, HSV, and CMYK formats. Perfect for designers and developers.',
  keywords: 'color picker, hex to rgb, color converter, hsl to rgb, hsv converter, cmyk converter, color tool, design tool',
  openGraph: {
    url: 'https://developers.do/tools/color-picker',
    title: 'Color Picker - Free Color Converter Tool',
    description: 'Pick colors and convert between HEX, RGB, HSL, HSV, and CMYK formats instantly.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function ColorPickerPage() {
  return <ColorPicker />;
}
