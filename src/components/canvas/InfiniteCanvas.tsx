'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Stage, Layer } from 'react-konva';
import type Konva from 'konva';
import { useCanvasStore } from '@/store/canvasStore';
import { useCanvas } from '@/hooks/useCanvas';
import { CanvasGrid } from './CanvasGrid';

export interface InfiniteCanvasProps {
  children?: React.ReactNode;
  onStageClick?: (e: Konva.KonvaEventObject<MouseEvent>) => void;
}

export const InfiniteCanvas: React.FC<InfiniteCanvasProps> = ({
  children,
  onStageClick,
}) => {
  const stageRef = useRef<Konva.Stage | null>(null);
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  const camera = useCanvasStore((state) => state.camera);
  const activeTool = useCanvasStore((state) => state.activeTool);
  const clearSelection = useCanvasStore((state) => state.clearSelection);
  const panBy = useCanvasStore((state) => state.panBy);

  const { handleWheel } = useCanvas();

  // Track window dimensions for responsive full-screen canvas
  useEffect(() => {
    const updateSize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Track Spacebar for temporary pan tool override
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpacePressed && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setIsSpacePressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isSpacePressed]);

  // Stage click handler (deselect when clicking blank canvas background)
  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const clickedOnStage = e.target === e.target.getStage();
      if (clickedOnStage) {
        clearSelection();
      }
      if (onStageClick) {
        onStageClick(e);
      }
    },
    [clearSelection, onStageClick]
  );

  // Stage DragEnd for panning
  const isPanningMode = activeTool === 'pan' || isSpacePressed;

  return (
    <div
      className={`relative w-full h-full overflow-hidden select-none bg-slate-950 ${
        isPanningMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'
      }`}
    >
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        onWheel={handleWheel}
        onClick={handleStageClick}
        draggable={isPanningMode}
        onDragMove={(e) => {
          if (isPanningMode && e.target === stageRef.current) {
            const dx = -e.evt.movementX / camera.scale;
            const dy = -e.evt.movementY / camera.scale;
            panBy(dx, dy);
            // Lock stage position so camera offset manages transform
            stageRef.current.position({ x: 0, y: 0 });
          }
        }}
      >
        {/* Layer 1: Infinite Grid Background */}
        <CanvasGrid camera={camera} stageSize={dimensions} />

        {/* Layer 2: Main Canvas Objects (Children) */}
        <Layer>{children}</Layer>
      </Stage>

      {/* Floating Canvas Controls (Zoom Info & Reset) */}
      <div className="absolute bottom-6 left-6 z-20 flex items-center gap-2 glass-panel p-1.5 px-3 text-xs text-slate-300 font-mono border border-slate-800 shadow-xl">
        <span className="font-bold text-indigo-400">
          {Math.round(camera.scale * 100)}%
        </span>
        <span className="text-slate-600">|</span>
        <span>
          X: {Math.round(camera.x)} Y: {Math.round(camera.y)}
        </span>
      </div>
    </div>
  );
};
