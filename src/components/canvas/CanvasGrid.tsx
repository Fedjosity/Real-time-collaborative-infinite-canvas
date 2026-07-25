'use client';

import React, { useMemo } from 'react';
import { Layer, Circle, Rect } from 'react-konva';
import type { Camera } from '@/types/canvas';
import { calculateVisibleGridDots } from '@/lib/canvas/grid';

export interface CanvasGridProps {
  camera: Camera;
  stageSize: { width: number; height: number };
}

export const CanvasGrid: React.FC<CanvasGridProps> = React.memo(
  ({ camera, stageSize }) => {
    const dots = useMemo(
      () => calculateVisibleGridDots(camera, stageSize),
      [camera, stageSize]
    );

    // Compute the world-space extent of the visible area for the solid background rect
    const bgX = -camera.x / camera.scale - 100000;
    const bgY = -camera.y / camera.scale - 100000;
    const bgSize = 200000;

    return (
      <Layer listening={false}>
        {/* Solid light background that covers the infinite canvas */}
        <Rect
          x={bgX}
          y={bgY}
          width={bgSize}
          height={bgSize}
          fill="#f8f9fa"
          listening={false}
        />
        {/* Dot grid — light grey dots on light background */}
        {dots.map((dot, index) => (
          <Circle
            key={`${dot.x}-${dot.y}-${index}`}
            x={(dot.x - camera.x) * camera.scale}
            y={(dot.y - camera.y) * camera.scale}
            radius={dot.size * camera.scale}
            fill="#c1c7d0"
            opacity={dot.opacity}
          />
        ))}
      </Layer>
    );
  }
);

CanvasGrid.displayName = 'CanvasGrid';
