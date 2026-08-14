import type { Metadata } from 'next';
import IosAppLookup from '../../../components/tools/IosAppLookup/IosAppLookup';

export const metadata: Metadata = {
  title: 'iOS App Lookup by Bundle ID - App Store Metadata Viewer (Free)',
  description: 'Free App Store lookup by bundle ID: view icon, ratings, version, file size, languages, screenshots, and raw iTunes Search API JSON. No login required.',
  alternates: {
    canonical: '/tools/ios-app-lookup',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/ios-app-lookup',
    title: 'iOS App Lookup - Find App Store Metadata by Bundle ID',
    description: 'Find App Store metadata from an iOS bundle ID, including version, ratings, file size, release dates, seller, genres, and raw JSON.',
    images: [{ url: '/og/tools/ios-app-lookup.png', width: 1200, height: 630, alt: 'iOS App Lookup tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/ios-app-lookup.png'],
  },
};

export default function IosAppLookupPage() {
  return <IosAppLookup />;
}
