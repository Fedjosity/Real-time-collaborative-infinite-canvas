'use client';

import React from 'react';
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
      x={object.x}
      y={object.y}
      rotation={object.rotation}
      onClick={onSelect}
      onTap={onSelect}
    >
      {/* Sticky Note Card Base */}
      <Rect
        width={object.width}
        height={object.height}
        fill={bgColor}
        cornerRadius={6}
        stroke={isSelected ? '#38BDF8' : 'rgba(0, 0, 0, 0.15)'}
        strokeWidth={isSelected ? 3 : 1}
        shadowColor="rgba(0, 0, 0, 0.3)"
        shadowBlur={isSelected ? 14 : 8}
        shadowOffsetY={4}
        shadowOpacity={0.4}
      />

      {/* Sticky Tape / Pin Visual Accent at Top */}
      <Rect
        x={object.width / 2 - 20}
        y={-6}
        width={40}
        height={12}
        fill="rgba(255, 255, 255, 0.4)"
        cornerRadius={2}
      />

      {/* Sticky Content Text */}
      <Text
        x={12}
        y={16}
        width={object.width - 24}
        height={object.height - 36}
        text={data.content || 'Sticky Note...'}
        fontSize={data.fontSize || 14}
        fontFamily="Inter, sans-serif"
        fill={textColor}
        wrap="word"
      />

      {/* Author Attribution Footer */}
      {data.author && (
        <Text
          x={12}
          y={object.height - 20}
          width={object.width - 24}
          text={`— ${data.author}`}
          fontSize={11}
          fontFamily="Inter, sans-serif"
          fontStyle="italic"
          fill="rgba(0, 0, 0, 0.45)"
          align="right"
        />
      )}
    </Group>
  );
};
