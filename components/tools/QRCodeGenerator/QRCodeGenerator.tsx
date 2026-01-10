'use client';

import { useState, useCallback } from 'react';
import QRCode from 'qrcode';
import ToolLayout from '../ToolLayout';
import Button from '../../shared/Button';

type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

interface QROptions {
  errorCorrectionLevel: ErrorCorrectionLevel;
  margin: number;
  width: number;
  color: {
    dark: string;
    light: string;
  };
}

function QRCodeGenerator() {
  const [text, setText] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<QROptions>({
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 256,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });

  const generateQRCode = useCallback(async () => {
    if (!text.trim()) {
      setError('Please enter some text or a URL');
      setQrDataUrl(null);
      return;
    }

    try {
      const dataUrl = await QRCode.toDataURL(text, {
        errorCorrectionLevel: options.errorCorrectionLevel,
        margin: options.margin,
        width: options.width,
        color: options.color,
      });
      setQrDataUrl(dataUrl);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate QR code');
      setQrDataUrl(null);
    }
  }, [text, options]);

  const downloadQRCode = useCallback(() => {
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = qrDataUrl;
    link.click();
  }, [qrDataUrl]);

  const copyToClipboard = useCallback(async () => {
    if (!qrDataUrl) return;

    try {
      const response = await fetch(qrDataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
    } catch {
      // Fallback: copy data URL as text
      await navigator.clipboard.writeText(qrDataUrl);
    }
  }, [qrDataUrl]);

  return (
    <ToolLayout
      title="QR Code Generator"
      description="Generate QR codes from text, URLs, or any data"
    >
      <div className="space-y-6">
        {/* Input */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Text or URL
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text, URL, or any data to encode..."
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
          />
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Error Correction Level */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Error Correction
            </label>
            <select
              value={options.errorCorrectionLevel}
              onChange={(e) =>
                setOptions({
                  ...options,
                  errorCorrectionLevel: e.target.value as ErrorCorrectionLevel,
                })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="L">Low (7%)</option>
              <option value="M">Medium (15%)</option>
              <option value="Q">Quartile (25%)</option>
              <option value="H">High (30%)</option>
            </select>
          </div>

          {/* Size */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Size (px)
            </label>
            <input
              type="number"
              min="64"
              max="1024"
              step="32"
              value={options.width}
              onChange={(e) =>
                setOptions({
                  ...options,
                  width: Math.max(64, Math.min(1024, Number(e.target.value))),
                })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Foreground Color */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Foreground
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={options.color.dark}
                onChange={(e) =>
                  setOptions({
                    ...options,
                    color: { ...options.color, dark: e.target.value },
                  })
                }
                className="h-10 w-12 border border-slate-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={options.color.dark}
                onChange={(e) =>
                  setOptions({
                    ...options,
                    color: { ...options.color, dark: e.target.value },
                  })
                }
                className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>
          </div>

          {/* Background Color */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Background
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={options.color.light}
                onChange={(e) =>
                  setOptions({
                    ...options,
                    color: { ...options.color, light: e.target.value },
                  })
                }
                className="h-10 w-12 border border-slate-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={options.color.light}
                onChange={(e) =>
                  setOptions({
                    ...options,
                    color: { ...options.color, light: e.target.value },
                  })
                }
                className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <Button
          label="Generate QR Code"
          onClick={generateQRCode}
          variant="primary"
        />

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* QR Code Display */}
        {qrDataUrl && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                <img
                  src={qrDataUrl}
                  alt="Generated QR Code"
                  className="max-w-full h-auto"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                label="Download PNG"
                onClick={downloadQRCode}
                variant="primary"
              />
              <Button
                label="Copy to Clipboard"
                onClick={copyToClipboard}
                variant="secondary"
              />
            </div>

            {/* Character Count */}
            <p className="text-center text-sm text-slate-500">
              Encoded {text.length} characters
            </p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export default QRCodeGenerator;
