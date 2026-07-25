'use client';

import React, { useMemo } from 'react';
import { Layer, Circle } from 'react-konva';
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

    return (
      <Layer listening={false}>
        {dots.map((dot, index) => (
          <Circle
            key={`${dot.x}-${dot.y}-${index}`}
            x={(dot.x - camera.x) * camera.scale}
            y={(dot.y - camera.y) * camera.scale}
            radius={dot.size * camera.scale}
            fill="#64748B"
            opacity={dot.opacity}
          />
        ))}
      </Layer>
    );
  }
);

CanvasGrid.displayName = 'CanvasGrid';
