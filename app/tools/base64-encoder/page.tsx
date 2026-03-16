import type { Metadata } from 'next';
import Base64EncoderDecoder from '../../../components/tools/Base64EncoderDecoder/Base64EncoderDecoder';

export const metadata: Metadata = {
  title: 'Base64 Encoder/Decoder - Convert Text & Base64',
  description: 'Free online Base64 encoder and decoder. Convert text to Base64 or decode Base64 to text instantly. Supports UTF-8 encoding. Perfect for encoding data, API testing, and web development.',
  keywords: 'base64 encoder, base64 decoder, base64 converter, encode base64, decode base64, base64 tool, base64 online, free base64, text to base64, how to encode to base64, how to decode base64, base64 encode string online, what is base64',
  openGraph: {
    url: 'https://developers.do/tools/base64-encoder',
    title: 'Base64 Encoder/Decoder - Free Online Base64 Converter',
    description: 'Encode text to Base64 or decode Base64 to text. Free online Base64 encoder and decoder with UTF-8 support.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function Base64EncoderPage() {
  return <Base64EncoderDecoder />;
}
