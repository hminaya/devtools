import type { Metadata } from 'next';
import IosAppLookup from '../../../components/tools/IosAppLookup/IosAppLookup';

export const metadata: Metadata = {
  title: 'iOS App Lookup - Find App Store Metadata by Bundle ID',
  description: 'Look up an iOS app by bundle ID and view App Store metadata, version, ratings, file size, seller, genres, release dates, and raw Apple Search API JSON.',
  keywords: 'ios app lookup, bundle id lookup, app store api, itunes search api, app metadata, ios bundle id, app store lookup, find app by bundle id, apple app info, how to find ios app by bundle id, look up app store app, get app metadata apple, find app version by bundle id',
  alternates: {
    canonical: '/tools/ios-app-lookup',
  },
  openGraph: {
    url: 'https://developers.do/tools/ios-app-lookup',
    title: 'iOS App Lookup - Find App Store Metadata by Bundle ID',
    description: 'Find App Store metadata from an iOS bundle ID, including version, ratings, file size, release dates, seller, genres, and raw JSON.',
    images: [{ url: '/og/tools/ios-app-lookup.png', width: 1200, height: 630, alt: 'Developer Tools Dashboard' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/ios-app-lookup.png'],
  },
};

export default function IosAppLookupPage() {
  return <IosAppLookup />;
}
