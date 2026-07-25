'use client';

import React, { useState, useEffect } from 'react';
import { Group, Rect, Text } from 'react-konva';
import type Konva from 'konva';
import type { CanvasObject, StickyData } from '@/types/canvas';

export interface StickyNoteProps {
  object: CanvasObject;
  isSelected: boolean;
  onSelect: (e: Konva.KonvaEventObject<any>) => void;
  onUpdate: (updatedData: Partial<StickyData>) => void;
}

export const StickyNote: React.FC<StickyNoteProps> = ({
  object,
  isSelected,
  onSelect,
  onUpdate,
}) => {
  const data = object.data as StickyData;
  const bgColor = data.backgroundColor || '#FEF08A';
  const textColor = data.textColor || '#1C1917';

  return (
    <Group
      x={0}
      y={0}
      rotation={0}
      onClick={onSelect}
      onTap={onSelect}
    >
      {/* Sticky Note Card Base */}
      <Rect
        x={0}
        y={0}
        width={object.width}
        height={object.height}
        fill={bgColor}
        cornerRadius={6}
        stroke={isSelected ? '#38BDF8' : 'rgba(0, 0, 0, 0.15)'}
        strokeWidth={isSelected ? 3 : 1}
        shadowColor={isSelected ? '#38BDF8' : 'rgba(0, 0, 0, 0.35)'}
        shadowBlur={isSelected ? 16 : 8}
        shadowOffsetY={4}
        shadowOpacity={0.4}
        opacity={object.opacity ?? 1}
      />

      {/* Folded Corner Decorator */}
      <Rect
        x={object.width - 20}
        y={0}
        width={20}
        height={20}
        fill="rgba(0, 0, 0, 0.08)"
        cornerRadius={[0, 6, 0, 6]}
      />

      {/* Sticky Note Content Text */}
      <Text
        x={12}
        y={14}
        width={object.width - 24}
        height={object.height - 28}
        text={data.content || 'Sticky Note'}
        fontSize={data.fontSize || 14}
        fontFamily="sans-serif"
        fill={textColor}
        lineHeight={1.4}
        wrap="word"
        ellipsis={true}
      />
    </Group>
  );
};
