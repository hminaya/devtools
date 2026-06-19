import type { Metadata } from 'next';
import IosAppLookup from '../../../components/tools/IosAppLookup/IosAppLookup';

export const metadata: Metadata = {
  title: 'iOS App Lookup - Find App Store Metadata by Bundle ID',
  description: 'Free iOS app lookup tool to find App Store metadata using bundle ID. View app details, ratings, screenshots, release notes, and download links. Uses Apple iTunes Search API.',
  keywords: 'ios app lookup, bundle id lookup, app store api, itunes search api, app metadata, ios bundle id, app store lookup, find app by bundle id, apple app info, how to find ios app by bundle id, look up app store app, get app metadata apple, find app version by bundle id',
  alternates: {
    canonical: '/tools/ios-app-lookup',
  },
  openGraph: {
    url: 'https://developers.do/tools/ios-app-lookup',
    title: 'iOS App Lookup - Find App Store Metadata by Bundle ID',
    description: 'Look up iOS app metadata from the App Store using bundle ID. View app details, ratings, screenshots, and more.',
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
