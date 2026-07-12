import type { Metadata } from 'next';
import PortReference from '../../../components/tools/PortReference/PortReference';

export const metadata: Metadata = {
  title: 'Common Port Number Reference - TCP/UDP Port Lookup',
  description: 'Searchable reference of common TCP/UDP ports for web, database, email, file transfer, remote access, messaging, networking, DevOps, and security services.',
  alternates: {
    canonical: '/tools/port-reference',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/port-reference',
    title: 'Common Port Number Reference',
    description: 'Search common TCP/UDP port numbers by port, service name, or category.',
    images: [{ url: '/og/tools/port-reference.png', width: 1200, height: 630, alt: 'Port Number Reference tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/port-reference.png'],
  },
};

export default function PortReferencePage() {
  return <PortReference />;
}