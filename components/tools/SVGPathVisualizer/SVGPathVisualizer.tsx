'use client';

import { useMemo, useState } from 'react';
import ToolLayout from '../ToolLayout';
import CopyButton from '../../shared/CopyButton';
import Button from '../../shared/Button';

const SAMPLE = 'M 10 80 C 40 10, 65 10, 95 80 S 150 150, 180 80';

const PRESETS = [
  { label: 'Curve', value: 'M 10 80 C 40 10, 65 10, 95 80 S 150 150, 180 80' },
  { label: 'Star', value: 'M 50 5 L 61 39 L 98 39 L 68 60 L 79 95 L 50 75 L 21 95 L 32 60 L 2 39 L 39 39 Z' },
  { label: 'Rectangle', value: 'M 10 10 H 90 V 90 H 10 Z' },
  { label: 'Arc', value: 'M 10 80 A 45 45 0 0 0 90 80' },
  { label: 'Bezier', value: 'M 10 50 Q 50 5 90 50' },
];

function SVGPathVisualizer() {
  const [pathData, setPathData] = useState(SAMPLE);
  const [showControls, setShowControls] = useState(false);
  const [stroke, setStroke] = useState('#3b82f6');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [fill, setFill] = useState('none');
  const [grid, setGrid] = useState(true);
  const [viewBoxSize, setViewBoxSize] = useState(100);

  // Wrap the path in an <svg>. We trust user path data here — SVG path
  // strings only contain drawing commands and numbers, not arbitrary markup.
  const svgHtml = useMemo(() => {
    const size = Math.max(50, Math.min(500, viewBoxSize));
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
${grid ? `<defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e2e8f0" stroke-width="0.5"/></pattern></defs><rect width="${size}" height="${size}" fill="url(#grid)"/>` : ''}
<path d="${pathData.replace(/"/g, '&quot;')}" stroke="${stroke}" stroke-width="${strokeWidth}" fill="${fill}" />
</svg>`;
  }, [pathData, stroke, strokeWidth, fill, grid, viewBoxSize]);

  return (
    <ToolLayout
      title="SVG Path Visualizer"
      description="Paste an SVG path's d attribute and see it rendered instantly. Show control point hints, grid overlay, and adjustable stroke/fill colors."
      fullWidth
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button label="Load Sample" onClick={() => setPathData(SAMPLE)} variant="secondary" />
          <Button label={showControls ? 'Hide options' : 'Show options'} onClick={() => setShowControls(!showControls)} variant="secondary" />
          <div className="flex-1" />
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => setPathData(p.value)}
              className="px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              {p.label}
            </button>
          ))}
          <CopyButton text={svgHtml} label="Copy SVG" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Path <code>d</code> attribute</label>
            <textarea
              value={pathData}
              onChange={(e) => setPathData(e.target.value)}
              rows={10}
              spellCheck={false}
              aria-label="Path d attribute"
              className="w-full resize-y rounded-xl border px-4 py-3 font-mono text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 border-slate-300 bg-white"
              placeholder="M 10 80 C 40 10, 65 10, 95 80"
            />
            <p className="text-xs text-slate-400 mt-1">
              {pathData.length} chars · Supports M, L, H, V, C, S, Q, T, A, Z and lowercase variants.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Rendered</label>
            <div className="rounded-xl border border-slate-300 bg-white p-6 min-h-[300px] flex items-center justify-center">
              <div dangerouslySetInnerHTML={{ __html: svgHtml }} />
            </div>
          </div>
        </div>

        {showControls && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Stroke color</label>
              <input type="color" value={stroke} onChange={(e) => setStroke(e.target.value)} aria-label="Stroke color" className="w-full" />
              <input type="text" value={stroke} onChange={(e) => setStroke(e.target.value)} aria-label="Stroke hex" className="mt-1 w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Stroke width</label>
              <input type="number" min="0.5" max="20" step="0.5" value={strokeWidth} onChange={(e) => setStrokeWidth(Number(e.target.value))} aria-label="Stroke width" className="w-full px-2 py-1 border border-slate-300 rounded text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Fill color</label>
              <input type="color" value={fill === 'none' ? '#ffffff' : fill} onChange={(e) => setFill(e.target.value)} aria-label="Fill color" className="w-full" disabled={fill === 'none'} />
              <select value={fill} onChange={(e) => setFill(e.target.value)} className="mt-1 w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono">
                <option value="none">none</option>
                <option value="#3b82f6">blue</option>
                <option value="#10b981">green</option>
                <option value="#ef4444">red</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">ViewBox size</label>
              <input type="number" min="50" max="500" step="10" value={viewBoxSize} onChange={(e) => setViewBoxSize(Number(e.target.value))} aria-label="ViewBox size" className="w-full px-2 py-1 border border-slate-300 rounded text-sm" />
              <label className="flex items-center gap-2 mt-2 text-xs text-slate-700 cursor-pointer">
                <input type="checkbox" checked={grid} onChange={(e) => setGrid(e.target.checked)} className="rounded border-slate-300" />
                Show grid
              </label>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export default SVGPathVisualizer;