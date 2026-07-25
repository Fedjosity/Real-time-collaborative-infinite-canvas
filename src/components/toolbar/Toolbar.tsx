'use client';

import React, { useState, useRef } from 'react';
import { useCanvasStore } from '@/store/canvasStore';
import { useUIStore } from '@/store/uiStore';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { ToolButton } from './ToolButton';
import { ColorPicker } from './ColorPicker';
import type { ShapeType } from '@/types/canvas';

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
  const toggleTimeTravelPanel = useUIStore((state) => state.toggleTimeTravelPanel);
  const showTimeTravelPanel = useUIStore((state) => state.showTimeTravelPanel);
  const toggleExportPanel = useUIStore((state) => state.toggleExportPanel);
  const addToast = useUIStore((state) => state.addToast);

  const [showShapeMenu, setShowShapeMenu] = useState(false);
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

  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-3 glass-panel p-2 bg-slate-950/80 border border-slate-800 shadow-2xl rounded-2xl">
      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleImageFileChange}
      />

      {/* Select / Move Tool */}
      <ToolButton
        label="Select & Move"
        shortcut="V"
        isActive={activeTool === 'select'}
        onClick={() => setActiveTool('select')}
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
          </svg>
        }
      />

      {/* Pan Tool */}
      <ToolButton
        label="Pan Canvas"
        shortcut="H / Space"
        isActive={activeTool === 'pan'}
        onClick={() => setActiveTool('pan')}
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0 0v2.5m0-2.5h10m0 0V11.5m0 2.5v2.5M11.5 7H14m-2.5 0H9m2.5 0v10" />
          </svg>
        }
      />

      <div className="w-full h-px bg-slate-800 my-0.5" />

      {/* Text Tool */}
      <ToolButton
        label="Add Text"
        shortcut="T"
        isActive={activeTool === 'text'}
        onClick={() => {
          setActiveTool('text');
          if (onAddObject) onAddObject('text');
        }}
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M12 6v12M9 18h6" />
          </svg>
        }
      />

      {/* Shape Tool & Submenu */}
      <div className="relative">
        <ToolButton
          label="Draw Shape"
          shortcut="S"
          isActive={activeTool === 'shape'}
          onClick={() => {
            setActiveTool('shape');
            setShowShapeMenu(!showShapeMenu);
          }}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
            </svg>
          }
        />

        {showShapeMenu && (
          <div className="absolute left-14 top-0 z-50 glass-panel p-2 bg-slate-900/95 border border-slate-800 shadow-2xl rounded-xl grid grid-cols-3 gap-1.5 w-36 animate-in fade-in zoom-in-95 duration-150">
            {shapes.map((s) => (
              <button
                key={s.type}
                type="button"
                className={`h-9 rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-colors cursor-pointer ${
                  shapeType === s.type
                    ? 'bg-indigo-600 text-white'
                    : 'hover:bg-slate-800 text-slate-300'
                }`}
                onClick={() => {
                  setShapeType(s.type);
                  setShowShapeMenu(false);
                  if (onAddObject) onAddObject('shape', { shapeType: s.type });
                }}
                title={s.label}
              >
                <span>{s.icon}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sticky Note Tool */}
      <ToolButton
        label="Sticky Note"
        shortcut="N"
        isActive={activeTool === 'sticky'}
        onClick={() => {
          setActiveTool('sticky');
          if (onAddObject) onAddObject('sticky');
        }}
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        }
      />

      {/* Image Upload Tool */}
      <ToolButton
        label="Upload Image"
        onClick={() => fileInputRef.current?.click()}
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        }
      />

      {/* Audio Recorder Tool */}
      <ToolButton
        label={isRecording ? 'Stop Recording' : 'Record Voice Note'}
        isActive={isRecording}
        onClick={handleAudioRecordClick}
        badge={
          isRecording ? (
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 animate-ping" />
          ) : undefined
        }
        icon={
          <svg className={`w-5 h-5 ${isRecording ? 'text-rose-400 animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        }
      />

      <div className="w-full h-px bg-slate-800 my-0.5" />

      {/* Color Picker */}
      <ColorPicker currentColor={currentColor} onChange={setCurrentColor} />

      {/* Physics Toggle Button */}
      <ToolButton
        label={physicsEnabled ? 'Disable Global Physics' : 'Enable Global Physics'}
        isActive={physicsEnabled}
        onClick={togglePhysics}
        icon={
          <svg className={`w-5 h-5 ${physicsEnabled ? 'text-amber-400' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        }
      />

      <div className="w-full h-px bg-slate-800 my-0.5" />

      {/* Time Travel Replay Toggle */}
      <ToolButton
        label="Time Travel Replay"
        isActive={showTimeTravelPanel}
        onClick={toggleTimeTravelPanel}
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />

      {/* Export Panel Toggle */}
      <ToolButton
        label="Export Canvas"
        onClick={toggleExportPanel}
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        }
      />

      {/* MiniMap Toggle */}
      <ToolButton
        label={showMiniMap ? 'Hide MiniMap' : 'Show MiniMap'}
        isActive={showMiniMap}
        onClick={toggleMiniMap}
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        }
      />
    </div>
  );
};
