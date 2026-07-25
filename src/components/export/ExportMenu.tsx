'use client';

import React, { useState, useRef } from 'react';
import type { CanvasObject } from '@/types/canvas';
import {
  exportCanvasToJson,
  exportCanvasToSvg,
  exportCanvasToPng,
  exportCanvasToJpeg,
  downloadFile,
  parseCanvasJson,
} from '@/lib/export/canvasExport';
import { Button } from '@/components/ui/Button';

export interface ExportMenuProps {
  objects: CanvasObject[];
  roomId: string;
  onImportObjects?: (importedObjects: CanvasObject[]) => void;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({
  objects,
  roomId,
  onImportObjects,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Export PNG Image
  const handleExportPng = async () => {
    setIsExporting(true);
    try {
      const blob = await exportCanvasToPng(objects);
      downloadFile(blob, `collabcanvas_${roomId}.png`, 'image/png');
    } catch (err) {
      console.error('PNG export failed', err);
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  // Export JPEG Image
  const handleExportJpeg = async () => {
    setIsExporting(true);
    try {
      const blob = await exportCanvasToJpeg(objects);
      downloadFile(blob, `collabcanvas_${roomId}.jpg`, 'image/jpeg');
    } catch (err) {
      console.error('JPEG export failed', err);
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  // Export SVG Vector File
  const handleExportSvg = () => {
    const svgContent = exportCanvasToSvg(objects);
    downloadFile(svgContent, `collabcanvas_${roomId}.svg`, 'image/svg+xml');
    setIsOpen(false);
  };

  // Export JSON workspace file
  const handleExportJson = () => {
    const jsonString = exportCanvasToJson(objects, roomId);
    downloadFile(jsonString, `collabcanvas_${roomId}.json`, 'application/json');
    setIsOpen(false);
  };

  // Trigger JSON file picker
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  // Process uploaded JSON file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const imported = parseCanvasJson(content);
        if (onImportObjects) {
          onImportObjects(imported);
        }
      } catch (err) {
        alert('Failed to parse JSON workspace file');
      }
    };
    reader.readAsText(file);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <input
        type="file"
        ref={fileInputRef}
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      <Button
        variant="outline"
        size="sm"
        isLoading={isExporting}
        onClick={() => setIsOpen(!isOpen)}
        icon={
          <svg className="w-4 h-4 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        }
      >
        Export
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-52 glass-panel p-1.5 bg-[#0e0e12]/95 border border-amber-500/30 shadow-2xl rounded-xl flex flex-col gap-1 text-xs">
          {/* PNG Export */}
          <button
            onClick={handleExportPng}
            className="flex items-center gap-2.5 px-3 py-2 text-slate-200 hover:text-amber-300 hover:bg-slate-800/60 rounded-lg transition-colors text-left cursor-pointer font-medium"
          >
            <span>🖼️</span>
            <span>Export PNG Image</span>
          </button>

          {/* JPEG Export */}
          <button
            onClick={handleExportJpeg}
            className="flex items-center gap-2.5 px-3 py-2 text-slate-200 hover:text-amber-300 hover:bg-slate-800/60 rounded-lg transition-colors text-left cursor-pointer font-medium"
          >
            <span>📷</span>
            <span>Export JPEG Image</span>
          </button>

          {/* SVG Vector Export */}
          <button
            onClick={handleExportSvg}
            className="flex items-center gap-2.5 px-3 py-2 text-slate-200 hover:text-amber-300 hover:bg-slate-800/60 rounded-lg transition-colors text-left cursor-pointer font-medium"
          >
            <span>🎨</span>
            <span>Export SVG Vector</span>
          </button>

          {/* JSON Workspace Export */}
          <button
            onClick={handleExportJson}
            className="flex items-center gap-2.5 px-3 py-2 text-slate-200 hover:text-amber-300 hover:bg-slate-800/60 rounded-lg transition-colors text-left cursor-pointer font-medium"
          >
            <span>📄</span>
            <span>Export JSON Workspace</span>
          </button>

          <div className="my-1 border-t border-amber-500/20" />

          {/* JSON Workspace Import */}
          <button
            onClick={handleImportClick}
            className="flex items-center gap-2.5 px-3 py-2 text-amber-300 hover:text-amber-200 hover:bg-slate-800/60 rounded-lg transition-colors text-left cursor-pointer font-semibold"
          >
            <span>📂</span>
            <span>Import JSON Canvas</span>
          </button>
        </div>
      )}
    </div>
  );
};
