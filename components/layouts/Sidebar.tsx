'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { POPULAR_TOOL_IDS, TOOLS } from '../../config/tools';
import { TOOL_CATEGORIES, getCategoryBySlug, getCategorySlug } from '../../config/seo';
import Logo from '../shared/Logo';

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="m16.5 16.5 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Sidebar() {
  const pathname = usePathname();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const openSearch = useCallback(() => {
    triggerRef.current = document.activeElement as HTMLElement;
    setIsSearchOpen(true);
    window.setTimeout(() => searchInputRef.current?.focus(), 0);
  }, []);

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
    setSearchQuery('');
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  }, []);

  const currentTool = TOOLS.find((tool) => tool.route === pathname);
  const categorySlug = pathname.split('/')[2];
  const currentCategory = currentTool?.category || (categorySlug ? getCategoryBySlug(categorySlug)?.name : undefined);

  useEffect(() => {
    setIsMobileOpen(false);
    if (currentCategory) {
      setExpandedCategories((previous) => new Set(previous).add(currentCategory));
    }
  }, [currentCategory, pathname]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        openSearch();
      } else if (event.key === '/' && !isTyping) {
        event.preventDefault();
        openSearch();
      } else if (event.key === 'Escape') {
        setIsSearchOpen(false);
        setIsMobileOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open_tool_search', openSearch);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open_tool_search', openSearch);
    };
  }, [openSearch]);

  useEffect(() => {
    if (!isSearchOpen) return;
    const handleTrap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, a[href], input, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', handleTrap);
    return () => window.removeEventListener('keydown', handleTrap);
  }, [isSearchOpen]);

  const results = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return POPULAR_TOOL_IDS
        .map((id) => TOOLS.find((tool) => tool.id === id))
        .filter((tool): tool is (typeof TOOLS)[number] => Boolean(tool));
    }

    return TOOLS.filter((tool) =>
      `${tool.name} ${tool.description} ${tool.category}`.toLowerCase().includes(query)
    ).slice(0, 12);
  }, [searchQuery]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((previous) => {
      const next = new Set(previous);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const linkClass = (route: string) =>
    `group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
      pathname === route
        ? 'bg-white/10 font-semibold text-white'
        : 'text-slate-300 hover:bg-white/5 hover:text-white'
    }`;

  const navigation = (
    <>
      <div className="border-b border-white/10 px-4 py-5">
        <Link href="/" prefetch={false} className="flex items-center gap-3" aria-label="developers.do home">
          <Logo size={34} />
          <div>
            <span className="block text-base font-bold tracking-tight text-white">developers.do</span>
            <span className="block text-xs text-slate-400">Tools for building things</span>
          </div>
        </Link>

        <button
          type="button"
          className="mt-5 flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-left text-sm text-slate-300 transition hover:border-white/20 hover:bg-white/10"
          onClick={() => openSearch()}
        >
          <SearchIcon />
          <span className="flex-1">Find a tool</span>
          <kbd className="rounded border border-white/10 bg-slate-950/40 px-1.5 py-0.5 text-[10px] text-slate-400">⌘K</kbd>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Tool navigation">
        <Link href="/" prefetch={false} className={linkClass('/')}>
          <span className="grid h-7 w-7 place-items-center rounded-md bg-white/5 text-sm" aria-hidden="true">⌂</span>
          <span>Home</span>
        </Link>

        <p className="mb-2 mt-6 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Categories</p>
        <div className="space-y-1">
          {TOOL_CATEGORIES.map((category) => {
            const tools = TOOLS.filter((tool) => tool.category === category.name);
            const isExpanded = expandedCategories.has(category.name);
            const isActive = currentCategory === category.name;

            return (
              <div key={category.name}>
                <button
                  type="button"
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                  aria-expanded={isExpanded}
                  onClick={() => toggleCategory(category.name)}
                >
                  <span className={`text-xs transition-transform ${isExpanded ? 'rotate-90' : ''}`} aria-hidden="true">›</span>
                  <span className="truncate">{category.name}</span>
                  <span className="ml-auto text-xs tabular-nums text-slate-500">{tools.length}</span>
                </button>

                {isExpanded && (
                  <div className="ml-5 mt-1 space-y-0.5 border-l border-white/10 pl-2">
                    <Link
                      href={`/tools/${getCategorySlug(category.name)}`}
                      prefetch={false}
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-blue-300 transition-colors hover:bg-white/5 hover:text-blue-200"
                    >
                      <span>View all {category.name}</span>
                      <span aria-hidden="true">→</span>
                    </Link>
                    {tools.map((tool) => tool.external ? (
                      <a key={tool.id} href={tool.route} target="_blank" rel="noopener noreferrer" className={linkClass(tool.route)}>
                        <span className="text-base" aria-hidden="true">{tool.icon}</span>
                        <span className="truncate">{tool.name}</span>
                      </a>
                    ) : (
                      <Link key={tool.id} href={tool.route} prefetch={false} className={linkClass(tool.route)}>
                        <span className="text-base" aria-hidden="true">{tool.icon}</span>
                        <span className="truncate">{tool.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-white/10 p-4 text-xs text-slate-500">
        <div className="flex items-center justify-between">
          <span>Free · No signup</span>
          <a className="hover:text-white" href="https://github.com/hminaya/devtools" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
        </div>
      </div>
    </>
  );

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center gap-2 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur lg:hidden">
        <Link href="/" prefetch={false} className="flex min-w-0 flex-1 items-center gap-2.5" aria-label="developers.do home">
          <Logo size={30} />
          <span className="truncate font-bold tracking-tight text-slate-950">developers.do</span>
        </Link>
        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
          aria-label="Search tools"
          onClick={() => openSearch()}
        >
          <SearchIcon />
        </button>
        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-lg bg-slate-950 text-white"
          aria-controls="mobile-navigation"
          aria-expanded={isMobileOpen}
          aria-label={isMobileOpen ? 'Close navigation' : 'Open navigation'}
          onClick={() => setIsMobileOpen((open) => !open)}
        >
          <MenuIcon open={isMobileOpen} />
        </button>
      </header>

      {isMobileOpen && (
        <button type="button" className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden" aria-label="Close navigation" onClick={() => setIsMobileOpen(false)} />
      )}

      <aside
        id="mobile-navigation"
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-72 max-w-[88vw] flex-col bg-slate-950 shadow-2xl transition-transform duration-200 lg:static lg:z-auto lg:w-72 lg:max-w-none lg:shrink-0 lg:translate-x-0 lg:shadow-none ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {navigation}
      </aside>

      {isSearchOpen && (
        <div
          ref={dialogRef}
          className="fixed inset-0 z-[70] flex items-start justify-center bg-slate-950/55 px-4 pt-[8vh] backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Find a developer tool"
        >
          <button type="button" className="absolute inset-0" aria-label="Close search" onClick={closeSearch} />
          <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center gap-3 border-b border-slate-200 px-4">
              <SearchIcon />
              <input
                ref={searchInputRef}
                autoFocus
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-14 min-w-0 flex-1 bg-transparent text-base text-slate-950 outline-none placeholder:text-slate-400"
                placeholder="Search JSON, SAML, regex, timestamps…"
                aria-label="Search tools"
              />
              <button type="button" className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:bg-slate-50" onClick={closeSearch}>Esc</button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2">
              <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                {searchQuery.trim() ? `${results.length} matches` : 'Popular tools'}
              </p>
              {results.length > 0 ? results.map((tool) => {
                const content = (
                  <>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-lg" aria-hidden="true">{tool.icon}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-slate-900">{tool.name}</span>
                      <span className="block truncate text-sm text-slate-500">{tool.description}</span>
                    </span>
                    <span className="text-xs text-slate-400">{tool.category}</span>
                  </>
                );
                const className = 'flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-slate-50';

                return tool.external ? (
                  <a key={tool.id} className={className} href={tool.route} target="_blank" rel="noopener noreferrer" onClick={closeSearch}>{content}</a>
                ) : (
                  <Link key={tool.id} className={className} href={tool.route} prefetch={false} onClick={closeSearch}>{content}</Link>
                );
              }) : (
                <div className="px-4 py-12 text-center">
                  <p className="font-semibold text-slate-900">No tools found</p>
                  <p className="mt-1 text-sm text-slate-500">Try a task like “decode”, “convert”, or “generate”.</p>
                </div>
              )}
            </div>
            <div className="border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-500">Press <kbd className="font-semibold">/</kbd> anywhere to search</div>
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
