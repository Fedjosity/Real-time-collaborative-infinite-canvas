'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer } from 'react-konva';
import type Konva from 'konva';
import { useCanvasStore } from '@/store/canvasStore';
import { useCanvas } from '@/hooks/useCanvas';
import { CanvasGrid } from './CanvasGrid';
import { CanvasObjectItem } from './CanvasObject';
import type { CanvasObject } from '@/types/canvas';

export interface InfiniteCanvasProps {
  objects?: CanvasObject[];
  selectedObjectIds?: string[];
  onSelectObject?: (id: string, multiSelect: boolean) => void;
  onUpdateObject?: (id: string, attrs: Partial<CanvasObject>) => void;
  children?: React.ReactNode;
  onStageClick?: (e: Konva.KonvaEventObject<any>) => void;
}

export const InfiniteCanvas: React.FC<InfiniteCanvasProps> = ({
  objects = [],
  selectedObjectIds = [],
  onSelectObject,
  onUpdateObject,
  children,
  onStageClick,
}) => {
  const stageRef = useRef<Konva.Stage | null>(null);
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  const camera = useCanvasStore((state) => state.camera);
  const activeTool = useCanvasStore((state) => state.activeTool);
  const clearSelection = useCanvasStore((state) => state.clearSelection);

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
      if (
        e.code === 'Space' &&
        !isSpacePressed &&
        !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || (e.target as HTMLElement).isContentEditable)
      ) {
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

  // Handle stage click (deselect when clicking empty space)
  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === stageRef.current || e.target.name() === 'canvas-grid-bg') {
      clearSelection();
    }
    if (onStageClick) {
      onStageClick(e);
    }
  };

  const isPanningActive = activeTool === 'pan' || isSpacePressed;

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#f8f9fa]">
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        x={camera.x}
        y={camera.y}
        scaleX={camera.scale}
        scaleY={camera.scale}
        draggable={isPanningActive}
        onWheel={handleWheel}
        onClick={handleStageClick}
        onTap={handleStageClick as any}
        onDragMove={(e) => {
          if (e.target === stageRef.current) {
            useCanvasStore.getState().setCamera({
              ...camera,
              x: e.target.x(),
              y: e.target.y(),
            });
          }
        }}
        onDragEnd={(e) => {
          if (e.target === stageRef.current) {
            useCanvasStore.getState().setCamera({
              ...camera,
              x: e.target.x(),
              y: e.target.y(),
            });
          }
        }}
        style={{
          cursor: isPanningActive ? 'grab' : activeTool === 'select' ? 'default' : 'crosshair',
        }}
      >
        {/* Background Infinite Grid Layer */}
        <CanvasGrid stageSize={dimensions} camera={camera} />

        {/* Dynamic Canvas Objects Layer */}
        <Layer>
          {objects.map((obj) => (
            <CanvasObjectItem
              key={obj.id}
              object={obj}
              isSelected={selectedObjectIds.includes(obj.id)}
              isDraggable={activeTool === 'select'}
              onSelect={(id, multi) => onSelectObject && onSelectObject(id, multi)}
              onChange={(id, attrs) => onUpdateObject && onUpdateObject(id, attrs)}
            />
          ))}
          {children}
        </Layer>
      </Stage>
    </div>
  );
};
