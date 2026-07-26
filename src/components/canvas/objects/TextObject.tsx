'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Group, Rect } from 'react-konva';
import { Html } from 'react-konva-utils';
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
  const editableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only update from external if we are not actively editing to avoid jumping cursor
    if (!isEditing) {
      setTextValue(data.content || 'Double-click to edit');
    }
  }, [data.content, isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setTimeout(() => {
      editableRef.current?.focus();
    }, 0);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editableRef.current) {
      onUpdate({ content: editableRef.current.innerHTML });
    }
  };

  return (
    <Group x={0} y={0} rotation={0} onClick={onSelect} onTap={onSelect}>
      <Html divProps={{ style: { pointerEvents: isEditing ? 'auto' : 'none' } }}>
        <div
          ref={editableRef}
          contentEditable={isEditing}
          onBlur={handleBlur}
          dangerouslySetInnerHTML={{ __html: textValue }}
          onInput={(e) => setTextValue(e.currentTarget.innerHTML)}
          style={{
            width: `${object.width}px`,
            height: `${object.height}px`,
            border: isEditing ? '1px dashed #0d99ff' : 'none',
            padding: '0px',
            margin: '0px',
            background: 'transparent',
            outline: 'none',
            color: data.color || '#E2E8F0',
            fontSize: `${data.fontSize || 18}px`,
            fontFamily: data.fontFamily || 'Inter, sans-serif',
            textAlign: data.align || 'left',
            lineHeight: data.lineHeight || 1.4,
            overflow: 'hidden',
            whiteSpace: 'pre-wrap',
            cursor: isEditing ? 'text' : 'pointer',
          }}
        />
      </Html>
      {!isEditing && (
        <Rect
          x={0}
          y={0}
          width={object.width}
          height={object.height}
          fill="transparent"
          onDblClick={handleDoubleClick}
          onDblTap={handleDoubleClick}
        />
      )}
    </Group>
  );
};
