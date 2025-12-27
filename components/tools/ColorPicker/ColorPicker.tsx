'use client';

import { useState, useRef, useEffect, type MouseEvent } from 'react';
import ToolLayout from '../ToolLayout';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import { getAllFormats, hsvToRgb, rgbToHex, type ColorFormats } from '../../../utils/colorConversion';

function ColorPicker() {
  const [hue, setHue] = useState(330);
  const [saturation, setSaturation] = useState(73);
  const [brightness, setBrightness] = useState(65);
  const [colorFormats, setColorFormats] = useState<ColorFormats | null>(null);
  const [isDraggingGradient, setIsDraggingGradient] = useState(false);
  const [isDraggingHue, setIsDraggingHue] = useState(false);

  const gradientRef = useRef<HTMLDivElement>(null);
  const hueSliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    updateColor(hue, saturation, brightness);
  }, [hue, saturation, brightness]);

  const updateColor = (h: number, s: number, v: number) => {
    const rgb = hsvToRgb({ h, s, v });
    const hex = rgbToHex(rgb);
    const formats = getAllFormats(hex);
    setColorFormats(formats);
  };

  const handleGradientMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    setIsDraggingGradient(true);
    updateGradientPosition(e);
  };

  const handleGradientMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isDraggingGradient) {
      updateGradientPosition(e);
    }
  };

  const handleGradientMouseUp = () => {
    setIsDraggingGradient(false);
  };

  const updateGradientPosition = (e: MouseEvent<HTMLDivElement>) => {
    if (!gradientRef.current) return;

    const rect = gradientRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));

    const newSaturation = Math.round((x / rect.width) * 100);
    const newBrightness = Math.round(100 - (y / rect.height) * 100);

    setSaturation(newSaturation);
    setBrightness(newBrightness);
  };

  const handleHueMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    setIsDraggingHue(true);
    updateHuePosition(e);
  };

  const handleHueMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isDraggingHue) {
      updateHuePosition(e);
    }
  };

  const handleHueMouseUp = () => {
    setIsDraggingHue(false);
  };

  const updateHuePosition = (e: MouseEvent<HTMLDivElement>) => {
    if (!hueSliderRef.current) return;

    const rect = hueSliderRef.current.getBoundingClientRect();
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    const newHue = Math.round((y / rect.height) * 360);

    setHue(newHue);
  };

  useEffect(() => {
    const handleMouseUp = () => {
      setIsDraggingGradient(false);
      setIsDraggingHue(false);
    };

    if (isDraggingGradient || isDraggingHue) {
      window.addEventListener('mouseup', handleMouseUp);
      return () => window.removeEventListener('mouseup', handleMouseUp);
    }
  }, [isDraggingGradient, isDraggingHue]);

  const gradientStyle = {
    background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))`,
  };

  const generateRandomColor = () => {
    const randomHue = Math.floor(Math.random() * 360);
    const randomSaturation = Math.floor(Math.random() * 100);
    const randomBrightness = Math.floor(Math.random() * 100);

    setHue(randomHue);
    setSaturation(randomSaturation);
    setBrightness(randomBrightness);
  };

  return (
    <ToolLayout
      title="Color Picker"
      description="Pick colors and convert between HEX, RGB, HSL, HSV, and CMYK formats"
    >
      <div className="space-y-6">
        <div className="flex gap-3">
          <Button label="Generate Random Color" onClick={generateRandomColor} variant="primary" />
          {colorFormats && <CopyButton text={colorFormats.hex} label="Copy HEX" />}
        </div>

        {colorFormats && (
          <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
            <div
              className="w-24 h-24 rounded-xl shadow-lg border-4 border-white flex-shrink-0"
              style={{
                background: colorFormats.hex,
              }}
            />
            <div>
              <div className="text-sm font-medium text-slate-500 mb-1">Current Color</div>
              <input
                type="text"
                value={colorFormats.hex}
                readOnly
                className="font-mono text-2xl font-bold text-slate-900 bg-transparent outline-none uppercase"
              />
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex gap-4">
              <div
                ref={hueSliderRef}
                className="relative w-8 h-80 rounded-lg cursor-pointer select-none flex-shrink-0"
                style={{
                  background: 'linear-gradient(to bottom, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
                }}
                onMouseDown={handleHueMouseDown}
                onMouseMove={handleHueMouseMove}
                onMouseUp={handleHueMouseUp}
              >
                <div
                  className="absolute w-10 h-3 bg-white border-2 border-slate-400 rounded-sm shadow-lg left-1/2 -translate-x-1/2 pointer-events-none"
                  style={{
                    top: `${(hue / 360) * 100}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              </div>

              <div
                ref={gradientRef}
                className="relative flex-1 h-80 rounded-lg cursor-crosshair select-none shadow-inner"
                style={gradientStyle}
                onMouseDown={handleGradientMouseDown}
                onMouseMove={handleGradientMouseMove}
                onMouseUp={handleGradientMouseUp}
              >
                <div
                  className="absolute w-6 h-6 border-3 border-white rounded-full shadow-xl pointer-events-none ring-2 ring-slate-900"
                  style={{
                    left: `${saturation}%`,
                    top: `${100 - brightness}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              </div>
            </div>
          </div>

          {colorFormats && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Color Formats</h3>

              <div className="space-y-2">
                <div className="bg-white border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="text-xs font-semibold text-slate-500 mb-1">RGB</div>
                  <div className="font-mono text-base text-slate-900">
                    {colorFormats.rgb.r}, {colorFormats.rgb.g}, {colorFormats.rgb.b}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="text-xs font-semibold text-slate-500 mb-1">HSL</div>
                  <div className="font-mono text-base text-slate-900">
                    {colorFormats.hsl.h}°, {colorFormats.hsl.s}%, {colorFormats.hsl.l}%
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="text-xs font-semibold text-slate-500 mb-1">HSV</div>
                  <div className="font-mono text-base text-slate-900">
                    {colorFormats.hsv.h}°, {colorFormats.hsv.s}%, {colorFormats.hsv.v}%
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="text-xs font-semibold text-slate-500 mb-1">CMYK</div>
                  <div className="font-mono text-base text-slate-900">
                    {colorFormats.cmyk.c}%, {colorFormats.cmyk.m}%, {colorFormats.cmyk.y}%, {colorFormats.cmyk.k}%
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}

export default ColorPicker;
