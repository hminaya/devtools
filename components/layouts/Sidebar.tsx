'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TOOLS } from '../../config/tools';
import { TOOL_CATEGORIES, getCategorySlug } from '../../config/seo';
import Logo from '../shared/Logo';

function Sidebar() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const linkClass = (route: string) =>
    `flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
      pathname === route
        ? 'bg-blue-500 text-white'
        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
    }`;

  // Filter tools based on search query
  const filteredTools = searchQuery.trim() === ''
    ? TOOLS
    : TOOLS.filter((tool) => {
        const query = searchQuery.toLowerCase();
        return (
          tool.name.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query) ||
          tool.category.toLowerCase().includes(query)
        );
      });

  // Group filtered tools by category
  const filteredCategories = filteredTools.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category]!.push(tool);
    return acc;
  }, {} as Record<string, typeof TOOLS>);

  const categoryOrder = TOOL_CATEGORIES.map((category) => category.name);

  const navigation = (
    <>
      {/* Logo/Title */}
      <div className="p-6 border-b border-slate-700">
        <Link href="/" prefetch={false} className="flex items-center gap-3" aria-label="developers.do home">
          <Logo size={36} />
          <span className="text-white text-xl font-bold">Developer Tools</span>
        </Link>

        {/* Search Input */}
        <div className="mt-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools..."
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-400 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {/* Dashboard Link */}
        <Link href="/" prefetch={false} className={linkClass('/')}>
          <span className="text-lg">📊</span>
          <span className="font-medium">Dashboard</span>
        </Link>

        {/* Tool Categories */}
        {categoryOrder.map((category) => {
          const tools = filteredCategories[category];

          // Hide category if no tools match the search
          if (!tools || tools.length === 0) {
            return null;
          }

          return (
            <div key={category} className="mt-6">
              <Link
                href={`/tools/${getCategorySlug(category)}`}
                prefetch={false}
                className="block px-4 py-2 text-slate-400 text-xs font-semibold uppercase tracking-wider hover:text-slate-200"
              >
                {category}
              </Link>
              <div className="space-y-1">
                {tools.map((tool) => (
                  tool.external ? (
                    <a
                      key={tool.id}
                      href={tool.route}
                      className={linkClass(tool.route)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="text-lg">{tool.icon}</span>
                      <span className="font-medium">{tool.name}</span>
                    </a>
                  ) : (
                    <Link key={tool.id} href={tool.route} prefetch={false} className={linkClass(tool.route)}>
                      <span className="text-lg">{tool.icon}</span>
                      <span className="font-medium">{tool.name}</span>
                    </Link>
                  )
                ))}
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {searchQuery.trim() !== '' && Object.keys(filteredCategories).length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-slate-400 text-sm">
              No tools found for "{searchQuery}"
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-2 text-blue-400 hover:text-blue-300 text-sm underline"
            >
              Clear search
            </button>
          </div>
        )}
      </nav>
    </>
  );

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-slate-700 bg-slate-800 px-4 lg:hidden">
        <Link href="/" prefetch={false} className="flex items-center gap-3" aria-label="developers.do home">
          <Logo size={32} />
          <span className="font-bold text-white">Developer Tools</span>
        </Link>
        <button
          type="button"
          className="rounded-md border border-slate-600 px-3 py-2 text-xl leading-none text-white"
          aria-controls="mobile-navigation"
          aria-expanded={isMobileOpen}
          aria-label={isMobileOpen ? 'Close navigation' : 'Open navigation'}
          onClick={() => setIsMobileOpen((open) => !open)}
        >
          {isMobileOpen ? '×' : '☰'}
        </button>
      </header>

      {isMobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
          aria-label="Close navigation"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        id="mobile-navigation"
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-72 max-w-[85vw] flex-col overflow-y-auto bg-slate-800 transition-transform lg:static lg:z-auto lg:w-64 lg:max-w-none lg:shrink-0 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {navigation}
      </aside>
    </>
  );
}

export default Sidebar;
