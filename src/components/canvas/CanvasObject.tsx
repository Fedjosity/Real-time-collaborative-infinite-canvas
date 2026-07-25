'use client';

import React, { useRef, useEffect } from 'react';
import { Group, Transformer } from 'react-konva';
import type Konva from 'konva';
import type { CanvasObject } from '@/types/canvas';
import { TextObject } from './objects/TextObject';
import { ShapeObject } from './objects/ShapeObject';
import { StickyNote } from './objects/StickyNote';
import { ImageObject } from './objects/ImageObject';
import { AudioObject } from './objects/AudioObject';

export interface CanvasObjectProps {
  object: CanvasObject;
  isSelected: boolean;
  isDraggable?: boolean;
  onSelect: (id: string, multiSelect: boolean) => void;
  onChange: (id: string, newAttrs: Partial<CanvasObject>) => void;
  onContextMenu?: (e: Konva.KonvaEventObject<PointerEvent>, id: string) => void;
}

export const CanvasObjectItem: React.FC<CanvasObjectProps> = ({
  object,
  isSelected,
  isDraggable = true,
  onSelect,
  onChange,
  onContextMenu,
}) => {
  const groupRef = useRef<Konva.Group | null>(null);
  const trRef = useRef<Konva.Transformer | null>(null);

  // Attach Konva Transformer handles when selected
  useEffect(() => {
    if (isSelected && trRef.current && groupRef.current) {
      trRef.current.nodes([groupRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const handleSelect = (e: Konva.KonvaEventObject<MouseEvent>) => {
    onSelect(object.id, e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey);
  };

  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    // Optional: Throttle real-time sync if needed, but for MVP local move is smooth natively.
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onChange(object.id, {
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const handleTransformEnd = () => {
    const node = groupRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Reset scale and update explicit width/height in state based on current object dimensions
    node.scaleX(1);
    node.scaleY(1);

    const newWidth = Math.max(20, Math.round(object.width * scaleX));
    const newHeight = Math.max(20, Math.round(object.height * scaleY));

    onChange(object.id, {
      x: node.x(),
      y: node.y(),
      width: newWidth,
      height: newHeight,
      rotation: Math.round(node.rotation()),
    });
  };

  const renderInnerObject = () => {
    switch (object.type) {
      case 'text':
        return (
          <TextObject
            object={object}
            isSelected={isSelected}
            onSelect={handleSelect}
            onUpdate={(updatedData) =>
              onChange(object.id, {
                data: { ...object.data, ...updatedData },
              })
            }
          />
        );
      case 'shape':
        return <ShapeObject object={object} isSelected={isSelected} onSelect={handleSelect} />;
      case 'sticky':
        return (
          <StickyNote
            object={object}
            isSelected={isSelected}
            onSelect={handleSelect}
            onUpdate={(updatedData) =>
              onChange(object.id, {
                data: { ...object.data, ...updatedData },
              })
            }
          />
        );
      case 'image':
        return <ImageObject object={object} isSelected={isSelected} onSelect={handleSelect} />;
      case 'audio':
        return <AudioObject object={object} isSelected={isSelected} onSelect={handleSelect} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Group
        ref={groupRef}
        x={object.x}
        y={object.y}
        width={object.width}
        height={object.height}
        rotation={object.rotation}
        draggable={isDraggable && !object.locked}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
        onContextMenu={(e) => onContextMenu && onContextMenu(e, object.id)}
      >
        {renderInnerObject()}
      </Group>

      {/* Resize & Rotation Handles */}
      {isSelected && !object.locked && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 20 || newBox.height < 20) {
              return oldBox;
            }
            return newBox;
          }}
          anchorSize={8}
          anchorCornerRadius={4}
          anchorFill="#38BDF8"
          anchorStroke="#0F172A"
          borderStroke="#38BDF8"
          borderStrokeWidth={1.5}
        />
      )}
    </>
  );
};
