/**
 * iOS App Lookup utilities using Apple's iTunes Search API
 */

// Using a flexible interface since the API may return different fields for different apps
export interface AppMetadata {
  // App identification
  trackId?: number;
  bundleId?: string;
  trackName?: string;

  // Developer info
  artistId?: number;
  artistName?: string;
  sellerName?: string;
  sellerUrl?: string;

  // App Store links
  trackViewUrl?: string;
  artistViewUrl?: string;

  // Images
  artworkUrl60?: string;
  artworkUrl100?: string;
  artworkUrl512?: string;
  screenshotUrls?: string[];
  ipadScreenshotUrls?: string[];

  // Pricing
  price?: number;
  currency?: string;
  formattedPrice?: string;

  // App details
  description?: string;
  releaseNotes?: string;
  version?: string;
  currentVersionReleaseDate?: string;
  releaseDate?: string;

  // Categories
  primaryGenreName?: string;
  primaryGenreId?: number;
  genres?: string[];
  genreIds?: string[];

  // Technical
  minimumOsVersion?: string;
  fileSizeBytes?: string;
  supportedDevices?: string[];
  languageCodesISO2A?: string[];

  // Ratings
  averageUserRating?: number;
  userRatingCount?: number;
  averageUserRatingForCurrentVersion?: number;
  userRatingCountForCurrentVersion?: number;
  contentAdvisoryRating?: string;

  // Content
  trackContentRating?: string;
  isGameCenterEnabled?: boolean;
  features?: string[];
}

export interface iTunesLookupResponse {
  resultCount: number;
  results: AppMetadata[];
}

export interface LookupResult {
  success: boolean;
  app?: AppMetadata;
  rawResponse?: iTunesLookupResponse;
  error?: string;
  responseTime?: number;
}

/**
 * Look up an iOS app by its bundle ID using Apple's iTunes Search API
 * Uses JSONP to bypass CORS restrictions
 */
export async function lookupAppByBundleId(bundleId: string): Promise<LookupResult> {
  const startTime = performance.now();

  if (!bundleId.trim()) {
    return {
      success: false,
      error: 'Please enter a bundle ID',
    };
  }

  // Basic validation - just check it has at least one dot (like com.example)
  if (!bundleId.includes('.')) {
    return {
      success: false,
      error: 'Invalid bundle ID format. Bundle IDs typically look like: com.company.appname',
    };
  }

  try {
    const data = await fetchWithJsonp(bundleId.trim());

    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);

    if (data.resultCount === 0 || !data.results || data.results.length === 0) {
      return {
        success: false,
        error: `No app found with bundle ID "${bundleId}". Make sure the app is available on the App Store.`,
        rawResponse: data,
        responseTime,
      };
    }

    const app = data.results[0];
    if (!app) {
      return {
        success: false,
        error: `No app found with bundle ID "${bundleId}". Make sure the app is available on the App Store.`,
        rawResponse: data,
        responseTime,
      };
    }

    return {
      success: true,
      app,
      rawResponse: data,
      responseTime,
    };
  } catch (error) {
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch app data',
      responseTime,
    };
  }
}

/**
 * Fetch data using JSONP to bypass CORS restrictions
 * The iTunes API supports a callback parameter for JSONP
 */
function fetchWithJsonp(bundleId: string): Promise<iTunesLookupResponse> {
  return new Promise((resolve, reject) => {
    const callbackName = `itunesCallback_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const timeout = 10000; // 10 second timeout

    // Create timeout handler
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('Request timed out'));
    }, timeout);

    // Cleanup function
    const cleanup = () => {
      clearTimeout(timeoutId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any)[callbackName];
      const script = document.getElementById(callbackName);
      if (script) {
        script.remove();
      }
    };

    // Create callback function on window object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any)[callbackName] = (data: iTunesLookupResponse) => {
      cleanup();
      resolve(data);
    };

    // Create and inject script
    const script = document.createElement('script');
    script.id = callbackName;
    script.src = `https://itunes.apple.com/lookup?bundleId=${encodeURIComponent(bundleId)}&callback=${callbackName}`;
    script.onerror = () => {
      cleanup();
      reject(new Error('Failed to load data from iTunes API'));
    };

    document.head.appendChild(script);
  });
}

/**
 * Format file size from bytes to human-readable format
 */
export function formatFileSize(bytes: string): string {
  const size = parseInt(bytes, 10);
  if (isNaN(size)) return 'Unknown';

  const units = ['B', 'KB', 'MB', 'GB'];
  let unitIndex = 0;
  let displaySize = size;

  while (displaySize >= 1024 && unitIndex < units.length - 1) {
    displaySize /= 1024;
    unitIndex++;
  }

  return `${displaySize.toFixed(unitIndex > 0 ? 1 : 0)} ${units[unitIndex]}`;
}

/**
 * Format date to a readable format
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Format rating with stars
 */
export function formatRating(rating?: number): string {
  if (rating === undefined || rating === null) return 'No ratings';
  return `${rating.toFixed(1)} / 5`;
}

/**
 * Format number with commas
 */
export function formatNumber(num?: number): string {
  if (num === undefined || num === null) return '0';
  return num.toLocaleString();
}

/**
 * Sample bundle IDs for demonstration
 */
export const sampleBundleIds = [
  { bundleId: 'com.hminaya.fedpulse', name: 'FedPulse' },
  { bundleId: 'com.hminaya.terremoto', name: 'Terremoto' },
  { bundleId: 'com.apple.Pages', name: 'Pages' },
  { bundleId: 'com.spotify.client', name: 'Spotify' },
  { bundleId: 'com.burbn.instagram', name: 'Instagram' },
  { bundleId: 'com.atebits.Tweetie2', name: 'X (Twitter)' },
  { bundleId: 'net.whatsapp.WhatsApp', name: 'WhatsApp' },
  { bundleId: 'com.google.chrome.ios', name: 'Chrome' },
];
