'use client';

export default function ToolSearchButton() {
  return (
    <button
      type="button"
      className="group flex w-full max-w-2xl items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-100"
      onClick={() => window.dispatchEvent(new Event('open_tool_search'))}
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5 text-slate-400">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
        <path d="m16.5 16.5 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="flex-1 text-slate-500 group-hover:text-slate-700">Search tools…</span>
      <kbd className="hidden rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-400 sm:inline">⌘ K</kbd>
    </button>
  );
}
