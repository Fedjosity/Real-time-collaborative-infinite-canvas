'use client';

import React, { useState } from 'react';
import { ALL_CANVAS_COLORS } from '@/lib/utils/colors';

export interface ColorPickerProps {
  currentColor: string;
  onChange: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  currentColor,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-xl border border-surface-variant flex items-center justify-center p-1.5 cursor-pointer bg-on-surface/60 hover:border-outline transition-all shadow-md"
        title="Color Palette"
      >
        <span
          className="w-full h-full rounded-lg border border-white/20 shadow-inner"
          style={{ backgroundColor: currentColor }}
        />
      </button>

      {isOpen && (
        <div className="absolute left-14 top-0 z-50 glass-panel p-3 bg-on-surface/95 border border-surface-variant shadow-2xl rounded-xl w-48 animate-in fade-in zoom-in-95 duration-150">
          <div className="text-xs font-medium text-outline-variant mb-2">Color Palette</div>
          <div className="grid grid-cols-6 gap-1.5 mb-3">
            {ALL_CANVAS_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={`w-6 h-6 rounded-md transition-transform cursor-pointer ${
                  currentColor === color ? 'ring-2 ring-indigo-400 scale-110' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => {
                  onChange(color);
                  setIsOpen(false);
                }}
              />
            ))}
          </div>

          {/* Custom Hex Color Input */}
          <div className="flex items-center gap-2 pt-2 border-t border-surface-variant">
            <input
              type="color"
              value={currentColor}
              onChange={(e) => onChange(e.target.value)}
              className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
            />
            <input
              type="text"
              value={currentColor}
              onChange={(e) => onChange(e.target.value)}
              className="w-full bg-on-surface text-xs font-mono px-2 py-1 rounded text-slate-200 border border-surface-variant outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};
