import type { Metadata } from 'next';
import CidrCalculator from '../../../components/tools/CidrCalculator/CidrCalculator';

export const metadata: Metadata = {
  title: 'CIDR / Subnet Calculator — IPv4 & IPv6',
  description:
    'CIDR calculator for IPv4 and IPv6. Compute network address, broadcast, subnet mask, wildcard, host range, usable hosts, IP class, RFC 1918 / ULA / loopback / link-local detection, reverse DNS PTR, and split subnets. 100% client-side.',
  alternates: {
    canonical: '/tools/cidr-calculator',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/cidr-calculator',
    title: 'CIDR / Subnet Calculator — IPv4 & IPv6',
    description:
      'IPv4 and IPv6 CIDR calculator with subnet splitting, RFC 1918 / ULA detection, reverse DNS PTR, and binary view. Free, client-side, no backend.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'CIDR / Subnet Calculator tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.png'],
  },
};

export default function CidrCalculatorPage() {
  return <CidrCalculator />;
}