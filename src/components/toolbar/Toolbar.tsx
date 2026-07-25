'use client';

import React, { useState, useRef } from 'react';
import { useCanvasStore } from '@/store/canvasStore';
import { useUIStore } from '@/store/uiStore';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import type { ShapeType } from '@/types/canvas';

// MUI Icons
import NearMeIcon from '@mui/icons-material/NearMe';
import PanToolIcon from '@mui/icons-material/PanTool';
import TitleIcon from '@mui/icons-material/Title';
import CategoryIcon from '@mui/icons-material/Category';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import ImageIcon from '@mui/icons-material/Image';
import MicIcon from '@mui/icons-material/Mic';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import MapIcon from '@mui/icons-material/Map';
import CircleIcon from '@mui/icons-material/Circle';

export interface ToolbarProps {
  onAddObject?: (type: string, extraData?: Record<string, unknown>) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onAddObject }) => {
  const activeTool = useCanvasStore((state) => state.activeTool);
  const setActiveTool = useCanvasStore((state) => state.setActiveTool);
  const shapeType = useCanvasStore((state) => state.shapeType);
  const setShapeType = useCanvasStore((state) => state.setShapeType);
  const currentColor = useCanvasStore((state) => state.currentColor);
  const setCurrentColor = useCanvasStore((state) => state.setCurrentColor);
  const physicsEnabled = useCanvasStore((state) => state.physicsEnabled);
  const togglePhysics = useCanvasStore((state) => state.togglePhysics);

  const toggleMiniMap = useUIStore((state) => state.toggleMiniMap);
  const showMiniMap = useUIStore((state) => state.showMiniMap);
  const addToast = useUIStore((state) => state.addToast);

  const [showShapeMenu, setShowShapeMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { isRecording, startRecording, stopRecording } = useAudioRecorder();

  // Handle Image Upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      if (onAddObject && src) {
        onAddObject('image', { src, alt: file.name });
        addToast({ type: 'success', message: 'Image added to canvas' });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Handle Audio Recording toggle
  const handleAudioRecordClick = async () => {
    if (isRecording) {
      try {
        const result = await stopRecording();
        if (onAddObject) {
          onAddObject('audio', {
            audioId: result.audioId,
            duration: result.duration,
            waveform: result.waveform,
          });
          addToast({ type: 'success', message: 'Voice recording added!' });
        }
      } catch (err) {
        addToast({ type: 'error', message: 'Failed to save audio recording' });
      }
    } else {
      try {
        await startRecording();
        addToast({ type: 'info', message: 'Recording audio... Click icon again to stop' });
      } catch (err) {
        addToast({ type: 'error', message: 'Microphone access required' });
      }
    }
  };

  const shapes: { type: ShapeType; label: string; icon: string }[] = [
    { type: 'rectangle', label: 'Rectangle', icon: '▭' },
    { type: 'circle', label: 'Circle', icon: '○' },
    { type: 'triangle', label: 'Triangle', icon: '△' },
    { type: 'star', label: 'Star', icon: '★' },
    { type: 'hexagon', label: 'Hexagon', icon: '⬡' },
    { type: 'arrow', label: 'Arrow', icon: '➔' },
  ];

  const paletteColors = [
    '#ffffff', '#0d99ff', '#6d43c6', '#ba1a1a', '#2e7d32', '#ed6c02', '#000000'
  ];

  return (
    <>
      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleImageFileChange}
      />

      {/* DESKTOP SIDEBAR TOOLBAR (Floating Vertical Bar) */}
      <nav className="fixed left-4 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-center gap-1.5 z-40 py-4 px-2 bg-white/90 dark:bg-inverse-surface/90 backdrop-blur-xl rounded-full border border-outline-variant/30 shadow-xl">
        {/* Select Tool */}
        <button
          onClick={() => setActiveTool('select')}
          className={`group relative flex items-center justify-center p-3 rounded-full active:scale-95 transition-all ${
            activeTool === 'select'
              ? 'bg-primary-container text-white shadow-md'
              : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
          title="Select & Move (V)"
        >
          <NearMeIcon fontSize="small" />
        </button>

        {/* Pan Tool */}
        <button
          onClick={() => setActiveTool('pan')}
          className={`group relative flex items-center justify-center p-3 rounded-full active:scale-95 transition-all ${
            activeTool === 'pan'
              ? 'bg-primary-container text-white shadow-md'
              : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
          title="Pan Canvas (H)"
        >
          <PanToolIcon fontSize="small" />
        </button>

        {/* Text Tool */}
        <button
          onClick={() => {
            if (activeTool === 'text') {
              if (onAddObject) onAddObject('text');
            } else {
              setActiveTool('text');
            }
          }}
          className={`group relative flex items-center justify-center p-3 rounded-full active:scale-95 transition-all ${
            activeTool === 'text'
              ? 'bg-primary-container text-white shadow-md'
              : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
          title="Add Text (T)"
        >
          <TitleIcon fontSize="small" />
        </button>

        {/* Shape Tool with Submenu */}
        <div className="relative">
          <button
            onClick={() => {
              if (activeTool === 'shape') {
                if (onAddObject) onAddObject('shape', { shapeType });
              } else {
                setActiveTool('shape');
                setShowShapeMenu(!showShapeMenu);
              }
            }}
            className={`group relative flex items-center justify-center p-3 rounded-full active:scale-95 transition-all ${
              activeTool === 'shape'
                ? 'bg-primary-container text-white shadow-md'
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
            title="Draw Shape (S)"
          >
            <CategoryIcon fontSize="small" />
          </button>

          {showShapeMenu && (
            <div className="absolute left-16 top-0 z-50 glass-panel p-2 bg-white/95 dark:bg-inverse-surface/95 border border-outline-variant/30 shadow-2xl rounded-2xl grid grid-cols-3 gap-1.5 w-36 animate-in fade-in zoom-in-95 duration-150">
              {shapes.map((s) => (
                <button
                  key={s.type}
                  type="button"
                  className={`h-9 rounded-xl flex items-center justify-center text-sm font-medium transition-colors cursor-pointer ${
                    shapeType === s.type
                      ? 'bg-primary text-white'
                      : 'hover:bg-surface-container-high text-on-surface-variant'
                  }`}
                  onClick={() => {
                    setShapeType(s.type);
                    setActiveTool('shape');
                    setShowShapeMenu(false);
                  }}
                  title={s.label}
                >
                  {s.icon}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sticky Note Tool */}
        <button
          onClick={() => {
            if (activeTool === 'sticky') {
              if (onAddObject) onAddObject('sticky');
            } else {
              setActiveTool('sticky');
            }
          }}
          className={`group relative flex items-center justify-center p-3 rounded-full active:scale-95 transition-all ${
            activeTool === 'sticky'
              ? 'bg-primary-container text-white shadow-md'
              : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
          title="Sticky Note (N)"
        >
          <StickyNote2Icon fontSize="small" />
        </button>

        {/* Image Tool */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="group relative flex items-center justify-center p-3 rounded-full text-on-surface-variant hover:bg-surface-container-high active:scale-95 transition-all"
          title="Upload Image"
        >
          <ImageIcon fontSize="small" />
        </button>

        {/* Audio Recording Tool */}
        <button
          onClick={handleAudioRecordClick}
          className={`group relative flex items-center justify-center p-3 rounded-full active:scale-95 transition-all ${
            isRecording
              ? 'bg-error text-white animate-pulse'
              : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
          title={isRecording ? 'Stop Recording' : 'Voice Note'}
        >
          <MicIcon fontSize="small" />
        </button>

        <div className="w-8 h-px bg-outline-variant/30 my-1" />

        {/* Color Palette Selector */}
        <div className="relative">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="group relative flex items-center justify-center p-2 rounded-full hover:bg-surface-container-high active:scale-95 transition-all"
            title="Color Palette"
          >
            <CircleIcon style={{ color: currentColor }} fontSize="small" />
          </button>
          {showColorPicker && (
            <div className="absolute left-16 top-0 z-50 glass-panel p-2 bg-white/95 dark:bg-inverse-surface/95 border border-outline-variant/30 shadow-2xl rounded-2xl flex flex-col gap-1.5 w-10 animate-in fade-in zoom-in-95">
              {paletteColors.map((c) => (
                <button
                  key={c}
                  className="w-6 h-6 rounded-full border border-outline-variant shadow-sm transition-transform hover:scale-110"
                  style={{ backgroundColor: c }}
                  onClick={() => {
                    setCurrentColor(c);
                    setShowColorPicker(false);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Eraser Tool */}
        <button
          onClick={() => setActiveTool('eraser')}
          className={`group relative flex items-center justify-center p-3 rounded-full active:scale-95 transition-all ${
            activeTool === 'eraser'
              ? 'bg-primary-container text-white shadow-md'
              : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
          title="Eraser"
        >
          <CleaningServicesIcon fontSize="small" />
        </button>

        {/* Physics Toggle */}
        <button
          onClick={togglePhysics}
          className={`group relative flex items-center justify-center p-3 rounded-full active:scale-95 transition-all ${
            physicsEnabled
              ? 'bg-tertiary text-white shadow-md animate-bounce'
              : 'text-tertiary hover:bg-tertiary-container/30'
          }`}
          title={physicsEnabled ? 'Physics Enabled' : 'Enable Physics'}
        >
          <RocketLaunchIcon fontSize="small" />
        </button>
      </nav>

      {/* MOBILE ADAPTIVE TOOLBAR (Bottom Horizontal Bar) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 pb-4 px-4 flex justify-center pointer-events-none md:hidden">
        <div className="glass-panel rounded-full h-16 w-full max-w-md flex items-center justify-between px-3 gap-1 pointer-events-auto bg-white/90 dark:bg-inverse-surface/90 border border-outline-variant/30 shadow-2xl overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTool('select')}
            className={`min-w-[44px] h-11 rounded-full flex items-center justify-center transition-all ${
              activeTool === 'select' ? 'bg-primary-container text-white' : 'text-on-surface-variant'
            }`}
          >
            <NearMeIcon fontSize="small" />
          </button>
          <button
            onClick={() => setActiveTool('pan')}
            className={`min-w-[44px] h-11 rounded-full flex items-center justify-center transition-all ${
              activeTool === 'pan' ? 'bg-primary-container text-white' : 'text-on-surface-variant'
            }`}
          >
            <PanToolIcon fontSize="small" />
          </button>
          <button
            onClick={() => setActiveTool('text')}
            className={`min-w-[44px] h-11 rounded-full flex items-center justify-center transition-all ${
              activeTool === 'text' ? 'bg-primary-container text-white' : 'text-on-surface-variant'
            }`}
          >
            <TitleIcon fontSize="small" />
          </button>
          <button
            onClick={() => setActiveTool('shape')}
            className={`min-w-[44px] h-11 rounded-full flex items-center justify-center transition-all ${
              activeTool === 'shape' ? 'bg-primary-container text-white' : 'text-on-surface-variant'
            }`}
          >
            <CategoryIcon fontSize="small" />
          </button>
          <button
            onClick={() => setActiveTool('sticky')}
            className={`min-w-[44px] h-11 rounded-full flex items-center justify-center transition-all ${
              activeTool === 'sticky' ? 'bg-primary-container text-white' : 'text-on-surface-variant'
            }`}
          >
            <StickyNote2Icon fontSize="small" />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="min-w-[44px] h-11 rounded-full flex items-center justify-center text-on-surface-variant"
          >
            <ImageIcon fontSize="small" />
          </button>
          <div className="w-px h-6 bg-outline-variant/30 shrink-0" />
          <button
            onClick={toggleMiniMap}
            className={`min-w-[44px] h-11 rounded-full flex items-center justify-center transition-all ${
              showMiniMap ? 'bg-primary text-white' : 'text-on-surface-variant'
            }`}
          >
            <MapIcon fontSize="small" />
          </button>
          <button
            onClick={togglePhysics}
            className={`min-w-[44px] h-11 rounded-full flex items-center justify-center transition-all ${
              physicsEnabled ? 'bg-tertiary text-white' : 'text-tertiary'
            }`}
          >
            <RocketLaunchIcon fontSize="small" />
          </button>
        </div>
      </nav>
    </>
  );
};
