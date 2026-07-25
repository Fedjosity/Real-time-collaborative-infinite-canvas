'use client';

import React, { useState, useEffect } from 'react';
import { Group, Rect, Text } from 'react-konva';
import { Html } from 'react-konva-utils';
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

  const [isEditing, setIsEditing] = useState(false);
  const [textValue, setTextValue] = useState(data.content || 'Sticky Note');

  useEffect(() => {
    setTextValue(data.content || 'Sticky Note');
  }, [data.content]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onUpdate({ content: textValue });
  };

  return (
    <Group
      x={0}
      y={0}
      rotation={0}
      onClick={onSelect}
      onTap={onSelect}
      onDblClick={handleDoubleClick}
      onDblTap={handleDoubleClick}
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
      {isEditing ? (
        <Html divProps={{ style: { pointerEvents: 'auto' } }}>
          <textarea
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === 'Escape' || (e.key === 'Enter' && !e.shiftKey)) {
                e.preventDefault();
                e.currentTarget.blur();
              }
            }}
            autoFocus
            style={{
              position: 'absolute',
              top: '14px',
              left: '12px',
              width: `${object.width - 24}px`,
              height: `${object.height - 28}px`,
              border: 'none',
              padding: '0px',
              margin: '0px',
              background: 'transparent',
              outline: 'none',
              resize: 'none',
              color: textColor,
              fontSize: `${data.fontSize || 14}px`,
              fontFamily: 'sans-serif',
              lineHeight: 1.4,
              overflow: 'hidden',
              whiteSpace: 'pre-wrap',
            }}
          />
        </Html>
      ) : (
        <Text
          x={12}
          y={14}
          width={object.width - 24}
          height={object.height - 28}
          text={textValue}
          fontSize={data.fontSize || 14}
          fontFamily="sans-serif"
          fill={textColor}
          lineHeight={1.4}
          wrap="word"
          ellipsis={true}
        />
      )}
    </Group>
  );
};
