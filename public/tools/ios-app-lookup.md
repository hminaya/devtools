# iOS App Lookup

> Look up iOS app metadata from the App Store using bundle ID

Live tool: https://www.developers.do/tools/ios-app-lookup
Category: Apps

Free and browser-based, but not fully offline: input is sent from the browser to Apple's public iTunes Search API. It is not sent to a developers.do server.

## Overview

Enter an iOS bundle ID — the reverse-DNS identifier like com.company.appname — and this tool queries Apple’s public iTunes Search API for the app’s current App Store metadata: icon, name, developer, seller, price, average rating and rating count, current version, release and update dates, file size, minimum iOS version, content rating, genres, supported languages, description, release notes, and screenshots. The raw JSON response is shown next to the formatted card for inspection or copying.

## How to use

1. Paste or type a bundle ID such as com.example.appname, then press Enter or choose Lookup App.
2. Review the formatted card: icon, ratings, version history, file size, languages, and screenshots.
3. Copy the raw JSON response if you need it for documentation or debugging.
4. Click one of the popular-app chips to see what a complete result looks like.

## Important details

### Bundle ID versus App Store ID

These are different identifiers. The bundle ID (com.company.app) is the reverse-DNS string you set in Xcode. The numeric App Store ID — the trackId, visible as id123456789 in an App Store URL — is assigned by Apple at publication. This tool searches by bundle ID and returns the numeric track ID in the result.

### Where to find a bundle ID

For your own apps: in Xcode under target settings, or in App Store Connect under App Information. For third-party apps: from an MDM inventory or a device management profile. Only apps currently published on the App Store resolve.

### The data comes straight from Apple

Results are whatever Apple returns from the iTunes Search API — the same feed behind App Store listings — so versions, prices, and ratings reflect the live storefront. TestFlight builds, enterprise apps, unlisted apps, and apps removed from sale are not returned.

## Frequently asked questions

### Why was my app not found?

The usual causes: a typo in the bundle ID, or the app is not currently on the App Store — TestFlight, enterprise, and removed apps are excluded from the search API. Verify the ID in App Store Connect.

### Can I search by app name instead?

This tool looks up exact bundle IDs. For name-based discovery, use the App Store first, then come back with the bundle ID for the full metadata view.

### Is this an official Apple tool?

No. It is an independent interface over Apple’s public iTunes Search API, which requires no authentication or developer account.

## References

- [Apple: iTunes Search API](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/)
