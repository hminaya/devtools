import type { Metadata } from 'next';
import JwtDecoder from '../../../components/tools/JwtDecoder/JwtDecoder';

export const metadata: Metadata = {
  title: 'JWT Decoder - Decode & Inspect JWT Tokens',
  description: 'Free JWT token decoder. Decode and inspect JWT (JSON Web Token) headers, payloads, and signatures. View token expiration, claims, and structure. Perfect for debugging and development.',
  keywords: 'jwt decoder, jwt token decoder, decode jwt, json web token, jwt inspector, jwt debugger, jwt parser, jwt tool, how to decode a jwt token, what is in my jwt, read jwt claims online, check jwt expiration, jwt token inspector free',
  openGraph: {
    url: 'https://developers.do/tools/jwt-decoder',
    title: 'JWT Decoder - Free JWT Token Inspector & Debugger',
    description: 'Decode and inspect JWT tokens. View headers, payloads, and signatures. Free JWT decoder for debugging and development.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function JwtDecoderPage() {
  return <JwtDecoder />;
}
