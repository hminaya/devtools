import type { Metadata } from 'next';
import ToolSearchButton from '../components/home/ToolSearchButton';
import Card from '../components/shared/Card';
import { POPULAR_TOOL_IDS, TOOLS } from '../config/tools';

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
};

export default function Dashboard() {
  const popularToolIds = new Set<string>(POPULAR_TOOL_IDS);
  const popularTools = POPULAR_TOOL_IDS
    .map((id) => TOOLS.find((tool) => tool.id === id))
    .filter((tool): tool is (typeof TOOLS)[number] => Boolean(tool));
  const remainingTools = TOOLS.filter((tool) => !popularToolIds.has(tool.id));

  return (
    <div className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Developer tools</h1>
          <p className="mt-1 text-sm text-slate-500">Fast browser utilities. No signup.</p>
          <div className="mt-5">
            <ToolSearchButton />
          </div>
        </header>

        <section className="mt-9" aria-labelledby="popular-tools-heading">
          <h2 id="popular-tools-heading" className="mb-3 text-sm font-semibold text-slate-900">Popular</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6">
            {popularTools.map((tool) => (
              <Card
                key={tool.id}
                icon={tool.icon}
                title={tool.name}
                description={tool.description}
                href={tool.route}
                compact
              />
            ))}
          </div>
        </section>

        <section className="mt-9" aria-labelledby="all-tools-heading">
          <h2 id="all-tools-heading" className="mb-3 text-sm font-semibold text-slate-900">All tools</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6">
            {remainingTools.map((tool) => (
              <Card
                key={tool.id}
                icon={tool.icon}
                title={tool.name}
                description={tool.description}
                href={tool.route}
                external={tool.external}
                compact
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
