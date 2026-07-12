import type { Metadata } from 'next';
import SemVerComparator from '../../../components/tools/SemVerComparator/SemVerComparator';

export const metadata: Metadata = {
  title: 'SemVer Comparator - Compare & Sort Semantic Versions',
  description: 'Compare two semantic version strings, sort lists of versions, and validate SemVer 2.0.0 syntax including prerelease and build metadata. Free online tool.',
  alternates: {
    canonical: '/tools/semver-comparator',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/semver-comparator',
    title: 'SemVer Comparator - Compare & Sort Semantic Versions',
    description: 'Pairwise comparison and batch sorting of SemVer 2.0.0 version strings with prerelease support.',
    images: [{ url: '/og/tools/semver-comparator.png', width: 1200, height: 630, alt: 'SemVer Comparator tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/semver-comparator.png'],
  },
};

export default function SemVerComparatorPage() {
  return <SemVerComparator />;
}