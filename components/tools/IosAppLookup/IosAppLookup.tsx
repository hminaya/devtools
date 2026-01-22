'use client';

import { useState } from 'react';
import ToolLayout from '../ToolLayout';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import CodeDisplay from '../../shared/CodeDisplay';
import {
  lookupAppByBundleId,
  formatFileSize,
  formatDate,
  formatRating,
  formatNumber,
  sampleBundleIds,
  type LookupResult,
  type AppMetadata,
} from '../../../utils/iosAppLookup';

function IosAppLookup() {
  const [bundleId, setBundleId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LookupResult | null>(null);

  const handleLookup = async () => {
    setLoading(true);
    setResult(null);
    try {
      const lookupResult = await lookupAppByBundleId(bundleId);
      setResult(lookupResult);
    } catch (err) {
      setResult({
        success: false,
        error: err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSampleClick = (sampleBundleId: string) => {
    setBundleId(sampleBundleId);
    setResult(null);
  };

  const loadRandomSample = () => {
    const randomIndex = Math.floor(Math.random() * sampleBundleIds.length);
    const sample = sampleBundleIds[randomIndex];
    if (sample) {
      setBundleId(sample.bundleId);
      setResult(null);
    }
  };

  const clear = () => {
    setBundleId('');
    setResult(null);
  };

  return (
    <ToolLayout
      title="iOS App Lookup"
      description="Look up iOS app metadata from the App Store using bundle ID"
    >
      <div className="space-y-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Bundle ID
            </label>
            <input
              type="text"
              value={bundleId}
              onChange={(e) => setBundleId(e.target.value)}
              placeholder="com.example.appname"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleLookup();
                }
              }}
            />
          </div>

          <div className="flex gap-3 flex-wrap">
            <Button
              label={loading ? 'Looking up...' : 'Lookup App'}
              onClick={handleLookup}
              variant="primary"
              disabled={loading || !bundleId.trim()}
            />
            <Button label="Load Sample" onClick={loadRandomSample} variant="secondary" />
            <Button label="Clear" onClick={clear} variant="secondary" />
          </div>
        </div>

        {/* Sample Bundle IDs */}
        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">Try these popular apps:</p>
          <div className="flex flex-wrap gap-2">
            {sampleBundleIds.slice(0, 6).map((sample) => (
              <button
                key={sample.bundleId}
                onClick={() => handleSampleClick(sample.bundleId)}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-md text-sm hover:bg-slate-200 transition-colors"
              >
                {sample.name}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {result && !result.success && result.error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700 font-medium">Error</p>
            <p className="text-red-600 text-sm mt-1">{result.error}</p>
            {result.responseTime && (
              <p className="text-red-500 text-xs mt-2">Response time: {result.responseTime}ms</p>
            )}
          </div>
        )}

        {/* App Metadata Display */}
        {result?.success && result.app && (
          <AppMetadataCard app={result.app} responseTime={result.responseTime} />
        )}

        {/* Raw JSON Response */}
        {result?.rawResponse && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-slate-700">
                Raw JSON Response
              </label>
              <CopyButton
                text={JSON.stringify(result.rawResponse, null, 2)}
                label="Copy JSON"
              />
            </div>
            <CodeDisplay
              code={JSON.stringify(result.rawResponse, null, 2)}
              language="json"
            />
          </div>
        )}

        {/* Info Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-blue-800 text-sm">
            <strong>Note:</strong> This tool uses Apple&apos;s iTunes Search API to fetch app metadata.
            Only apps available on the App Store can be looked up. The bundle ID is typically in
            the format <code className="bg-blue-100 px-1 rounded">com.company.appname</code>.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}

interface AppMetadataCardProps {
  app: AppMetadata;
  responseTime?: number;
}

function AppMetadataCard({ app, responseTime }: AppMetadataCardProps) {
  return (
    <div className="space-y-6">
      {/* Response time indicator */}
      {responseTime && (
        <div className="text-sm text-slate-500">
          Found in {responseTime}ms
        </div>
      )}

      {/* Main App Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
        {/* Header with icon and basic info */}
        <div className="flex gap-4 mb-6">
          {app.artworkUrl512 && (
            <img
              src={app.artworkUrl512}
              alt={`${app.trackName || 'App'} icon`}
              className="w-24 h-24 rounded-2xl shadow-md"
            />
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-slate-900 truncate">{app.trackName || 'Unknown App'}</h2>
            <p className="text-slate-600">{app.artistName || 'Unknown Developer'}</p>
            <div className="flex items-center gap-3 mt-2">
              {app.primaryGenreName && (
                <span className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-sm">
                  {app.primaryGenreName}
                </span>
              )}
              {app.formattedPrice && (
                <span className="text-slate-600 text-sm">
                  {app.formattedPrice}
                </span>
              )}
            </div>
            {app.averageUserRating !== undefined && app.userRatingCount !== undefined && app.userRatingCount > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-yellow-500">★</span>
                <span className="text-slate-700 text-sm">
                  {formatRating(app.averageUserRating)} ({formatNumber(app.userRatingCount)} ratings)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* App Store Link */}
        {app.trackViewUrl && (
          <div className="mb-6">
            <a
              href={app.trackViewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              View on App Store
            </a>
          </div>
        )}

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {app.bundleId && <MetadataItem label="Bundle ID" value={app.bundleId} mono />}
          {app.version && <MetadataItem label="Version" value={app.version} />}
          {app.releaseDate && <MetadataItem label="Release Date" value={formatDate(app.releaseDate)} />}
          {app.currentVersionReleaseDate && <MetadataItem label="Last Updated" value={formatDate(app.currentVersionReleaseDate)} />}
          {app.fileSizeBytes && <MetadataItem label="File Size" value={formatFileSize(app.fileSizeBytes)} />}
          {app.minimumOsVersion && <MetadataItem label="Minimum iOS" value={`iOS ${app.minimumOsVersion}`} />}
          {app.contentAdvisoryRating && <MetadataItem label="Content Rating" value={app.contentAdvisoryRating} />}
          {app.sellerName && <MetadataItem label="Seller" value={app.sellerName} />}
          {app.trackId && <MetadataItem label="Track ID" value={app.trackId.toString()} mono />}
          {app.artistId && <MetadataItem label="Artist ID" value={app.artistId.toString()} mono />}
        </div>

        {/* Genres */}
        {app.genres && app.genres.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-slate-700 mb-2">Genres</p>
            <div className="flex flex-wrap gap-2">
              {app.genres.map((genre, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-sm"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {app.languageCodesISO2A && app.languageCodesISO2A.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-slate-700 mb-2">
              Languages ({app.languageCodesISO2A.length})
            </p>
            <div className="flex flex-wrap gap-1">
              {app.languageCodesISO2A.slice(0, 20).map((lang, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-mono"
                >
                  {lang}
                </span>
              ))}
              {app.languageCodesISO2A.length > 20 && (
                <span className="px-2 py-0.5 text-slate-500 text-xs">
                  +{app.languageCodesISO2A.length - 20} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Description Section */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-3">Description</h3>
        <p className="text-slate-700 text-sm whitespace-pre-line leading-relaxed max-h-64 overflow-auto">
          {app.description}
        </p>
      </div>

      {/* Release Notes (if available) */}
      {app.releaseNotes && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            What&apos;s New in Version {app.version}
          </h3>
          <p className="text-slate-700 text-sm whitespace-pre-line leading-relaxed max-h-48 overflow-auto">
            {app.releaseNotes}
          </p>
        </div>
      )}

      {/* Screenshots */}
      {app.screenshotUrls && app.screenshotUrls.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            Screenshots ({app.screenshotUrls.length})
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {app.screenshotUrls.slice(0, 5).map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Screenshot ${index + 1}`}
                className="h-64 rounded-lg shadow-sm flex-shrink-0"
              />
            ))}
            {app.screenshotUrls.length > 5 && (
              <div className="h-64 w-32 flex-shrink-0 bg-slate-200 rounded-lg flex items-center justify-center">
                <span className="text-slate-600 text-sm">
                  +{app.screenshotUrls.length - 5} more
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface MetadataItemProps {
  label: string;
  value: string;
  mono?: boolean;
}

function MetadataItem({ label, value, mono = false }: MetadataItemProps) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={`text-slate-900 ${mono ? 'font-mono text-sm' : ''}`}>{value}</p>
    </div>
  );
}

export default IosAppLookup;
