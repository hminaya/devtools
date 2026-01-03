'use client';

import { useState, useRef, useEffect, type MouseEvent } from 'react';
import ToolLayout from '../ToolLayout';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import { getAllFormats, hsvToRgb, rgbToHex, hexToRgb, rgbToHsv, generateAllPalettes, type ColorFormats, type ColorPalette } from '../../../utils/colorConversion';

function ColorPicker() {
  const [hue, setHue] = useState(330);
  const [saturation, setSaturation] = useState(73);
  const [brightness, setBrightness] = useState(65);
  const [colorFormats, setColorFormats] = useState<ColorFormats | null>(null);
  const [palettes, setPalettes] = useState<ColorPalette[]>([]);
  const [isDraggingGradient, setIsDraggingGradient] = useState(false);
  const [isDraggingHue, setIsDraggingHue] = useState(false);
  const [hexInput, setHexInput] = useState('#d44382');
  const [isValidHex, setIsValidHex] = useState(true);

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
    setHexInput(hex);
    setIsValidHex(true);

    // Generate color palettes
    const generatedPalettes = generateAllPalettes(hex);
    setPalettes(generatedPalettes);
  };

  const validateAndApplyHex = (hex: string) => {
    // Normalize hex input (allow with or without #)
    const normalizedHex = hex.startsWith('#') ? hex : `#${hex}`;

    // Validate hex format (3 or 6 digit hex)
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

    if (hexRegex.test(normalizedHex)) {
      // Convert 3-digit hex to 6-digit
      let fullHex = normalizedHex;
      if (normalizedHex.length === 4) {
        fullHex = `#${normalizedHex[1]}${normalizedHex[1]}${normalizedHex[2]}${normalizedHex[2]}${normalizedHex[3]}${normalizedHex[3]}`;
      }

      // Convert to HSV and update sliders
      const rgb = hexToRgb(fullHex);
      const hsv = rgbToHsv(rgb);

      setHue(hsv.h);
      setSaturation(hsv.s);
      setBrightness(hsv.v);
      setHexInput(fullHex);
      setIsValidHex(true);
    } else {
      setIsValidHex(false);
    }
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHexInput(value);

    // Only validate and apply if it looks complete (3 or 6 hex digits)
    const cleanValue = value.replace('#', '');
    if (cleanValue.length === 3 || cleanValue.length === 6) {
      validateAndApplyHex(value);
    } else if (cleanValue.length > 6) {
      setIsValidHex(false);
    } else {
      // Still typing, don't mark as invalid yet
      setIsValidHex(true);
    }
  };

  const handleHexInputBlur = () => {
    // Validate on blur
    validateAndApplyHex(hexInput);
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
      fullWidth
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
            <div className="flex-1">
              <div className="text-sm font-medium text-slate-500 mb-1">Current Color - Type to change</div>
              <input
                type="text"
                value={hexInput}
                onChange={handleHexInputChange}
                onBlur={handleHexInputBlur}
                placeholder="#000000"
                className={`w-full font-mono text-2xl font-bold text-slate-900 bg-white px-3 py-2 rounded-md border-2 uppercase transition-colors ${
                  isValidHex
                    ? 'border-slate-300 focus:border-blue-500 focus:outline-none'
                    : 'border-red-500 focus:border-red-600 focus:outline-none'
                }`}
              />
              {!isValidHex && (
                <p className="text-red-600 text-sm mt-1">Invalid hex color. Use format: #RRGGBB or #RGB</p>
              )}
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

        {palettes.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800">Color Palettes</h3>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {palettes.map((palette) => (
                <div key={palette.type} className="bg-white border border-slate-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">{palette.type}</h4>
                  <div className="space-y-2">
                    {palette.colors.map((color, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 transition-colors group"
                      >
                        <div
                          className="w-12 h-12 rounded-md shadow-sm border border-slate-200 flex-shrink-0"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-slate-500">{color.name}</div>
                          <div className="font-mono text-sm text-slate-900 uppercase">{color.hex}</div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <CopyButton text={color.hex} label="" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export default ColorPicker;
