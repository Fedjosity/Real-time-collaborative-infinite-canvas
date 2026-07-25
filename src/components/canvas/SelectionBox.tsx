'use client';

import React from 'react';
import { Rect } from 'react-konva';

export interface SelectionBoxProps {
  box: { x: number; y: number; width: number; height: number } | null;
}

export const SelectionBox: React.FC<SelectionBoxProps> = ({ box }) => {
  if (!box) return null;

  return (
    <Rect
      x={box.x}
      y={box.y}
      width={box.width}
      height={box.height}
      fill="rgba(56, 189, 248, 0.12)"
      stroke="#38BDF8"
      strokeWidth={1}
      dash={[4, 4]}
      listening={false}
    />
  );
};
