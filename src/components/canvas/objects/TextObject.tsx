'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Text, Group } from 'react-konva';
import type Konva from 'konva';
import type { CanvasObject, TextData } from '@/types/canvas';

export interface TextObjectProps {
  object: CanvasObject;
  isSelected: boolean;
  onUpdate: (updatedData: Partial<TextData>) => void;
  onSelect: (e: Konva.KonvaEventObject<any>) => void;
}

export const TextObject: React.FC<TextObjectProps> = ({
  object,
  isSelected,
  onUpdate,
  onSelect,
}) => {
  const data = object.data as TextData;
  const [isEditing, setIsEditing] = useState(false);
  const [textValue, setTextValue] = useState(data.content || 'Double-click to edit');
  const textRef = useRef<Konva.Text | null>(null);

  useEffect(() => {
    setTextValue(data.content || 'Double-click to edit');
  }, [data.content]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onUpdate({ content: textValue });
  };

  return (
    <Group x={0} y={0} rotation={0} onClick={onSelect} onTap={onSelect}>
      <Text
        ref={textRef}
        x={0}
        y={0}
        text={textValue}
        fontSize={data.fontSize || 18}
        fontFamily={data.fontFamily || 'Inter, sans-serif'}
        fontStyle={data.fontStyle || 'normal'}
        fill={data.color || '#E2E8F0'}
        width={object.width}
        height={object.height}
        align={data.align || 'left'}
        lineHeight={data.lineHeight || 1.4}
        onDblClick={handleDoubleClick}
        onDblTap={handleDoubleClick}
        opacity={object.opacity ?? 1}
      />
    </Group>
  );
};
