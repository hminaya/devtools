'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { TOOLS } from '../../config/tools';
import { extractRecoveryTerms, getLatestTools, getReadablePathname, getRecoverySuggestions, type RecoverySuggestion } from '../../utils/urlRecovery';

function ToolSuggestionCard({ suggestion }: { suggestion: RecoverySuggestion }) {
  const content = (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xl">
          {suggestion.tool.icon}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900">{suggestion.tool.name}</h3>
            {suggestion.matchedTerms.length > 0 && (
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                match
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-600">{suggestion.tool.description}</p>
          {suggestion.matchedTerms.length > 0 && (
            <p className="mt-3 text-xs text-slate-500">
              Based on: {suggestion.matchedTerms.join(', ')}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  if (suggestion.tool.external) {
    return (
      <a href={suggestion.tool.route} rel="noopener noreferrer" target="_blank">
        {content}
      </a>
    );
  }

  return <Link href={suggestion.tool.route}>{content}</Link>;
}

function LatestToolCard({
  icon,
  name,
  description,
  route,
}: {
  icon: string;
  name: string;
  description: string;
  route: string;
}) {
  return (
    <Link href={route} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xl">
          {icon}
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-900">{name}</h3>
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        </div>
      </div>
    </Link>
  );
}

function NotFoundRecovery() {
  const [pathname, setPathname] = useState('/');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    setPathname(window.location.pathname || '/');
  }, []);

  const suggestions = getRecoverySuggestions(pathname, TOOLS, 6);
  const latestTools = getLatestTools(TOOLS, 6);
  const recoveryTerms = extractRecoveryTerms(pathname).slice(0, 6);

  return (
    <div className="min-h-full bg-slate-50 px-6 py-10 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 px-8 py-8 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-100">404</p>
            <h1 className="mt-3 text-3xl font-bold sm:text-4xl">That URL wandered off.</h1>
            <p className="mt-3 max-w-3xl text-sm text-blue-50 sm:text-base">
              The page is gone, but the path might still hint at what the visitor wanted. This page looks for loose keyword matches and offers the closest tools instead of a dead end.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100"
              >
                Open dashboard
              </Link>
              <Link
                href="/tools/api-tester"
                className="rounded-full border border-white/40 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                Try a tool
              </Link>
            </div>
          </div>

          <div className="px-8 py-8">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Missing path</p>
              <p className="mt-2 break-all font-mono text-sm text-slate-700">{getReadablePathname(pathname)}</p>
              {recoveryTerms.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {recoveryTerms.map((term) => (
                    <span
                      key={term}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600"
                    >
                      {term}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <section className="mt-8">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    {suggestions.length > 0 ? 'Possible matches' : 'Latest tools'}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {suggestions.length > 0
                      ? 'Loose matches based on words found in the URL.'
                      : 'Nothing matched the missing path, so here are the most recent internal tools.'}
                  </p>
                </div>
              </div>

              {suggestions.length > 0 ? (
                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {suggestions.map((suggestion) => (
                    <ToolSuggestionCard key={suggestion.tool.id} suggestion={suggestion} />
                  ))}
                </div>
              ) : (
                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {latestTools.map((tool) => (
                    <LatestToolCard
                      key={tool.id}
                      icon={tool.icon}
                      name={tool.name}
                      description={tool.description}
                      route={tool.route}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFoundRecovery;
