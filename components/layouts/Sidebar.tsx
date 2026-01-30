'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { TOOLS } from '../../config/tools';
import Logo from '../shared/Logo';

function Sidebar() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');

  const linkClass = (route: string) =>
    `flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
      pathname === route
        ? 'bg-blue-500 text-white'
        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
    }`;

  // Group tools by category
  const categories = TOOLS.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category]!.push(tool);
    return acc;
  }, {} as Record<string, typeof TOOLS>);

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

  // Define category order
  const categoryOrder = ['AI Tools', 'Algorithms', 'Formatting', 'Generators', 'Code & Schemas', 'Networking', 'Security', 'Data', 'Apps'];

  return (
    <div className="w-64 bg-slate-800 h-screen flex flex-col overflow-y-auto">
      {/* Logo/Title */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <Logo size={36} />
          <h1 className="text-white text-xl font-bold">Developer Tools</h1>
        </div>

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
        <Link href="/" className={linkClass('/')}>
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
              <div className="px-4 py-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                {category}
              </div>
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
                    <Link key={tool.id} href={tool.route} className={linkClass(tool.route)}>
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
    </div>
  );
}

export default Sidebar;
