import type { Metadata } from 'next';
import MorseCodeTranslator from '../../../components/tools/MorseCodeTranslator/MorseCodeTranslator';

export const metadata: Metadata = {
  title: 'Morse Code Translator - Text ↔ Morse (ITU-R M.1677-1)',
  description: 'Convert text to ITU-R M.1677-1 Morse code and back. Supports letters, digits, common punctuation, and word breaks. Includes a reference chart.',
  alternates: {
    canonical: '/tools/morse-code-translator',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/morse-code-translator',
    title: 'Morse Code Translator',
    description: 'Encode and decode ITU-R M.1677-1 Morse code with a reference chart.',
    images: [{ url: '/og/tools/morse-code-translator.png', width: 1200, height: 630, alt: 'Morse Code Translator tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/morse-code-translator.png'],
  },
};

export default function MorseCodeTranslatorPage() {
  return <MorseCodeTranslator />;
}