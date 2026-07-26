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
  onChange: (id: string, attrs: Partial<CanvasObject>) => void;
  onContextMenu?: (e: Konva.KonvaEventObject<PointerEvent>, id: string) => void;
  onThrowObject?: (id: string, velocity: { x: number; y: number }, position: { x: number; y: number }) => void;
  localUserId?: string | null;
}

export const CanvasObjectItem: React.FC<CanvasObjectProps> = ({
  object,
  isSelected,
  isDraggable = true,
  onSelect,
  onChange,
  onContextMenu,
  onThrowObject,
  localUserId,
}) => {
  const groupRef = useRef<Konva.Group | null>(null);
  const trRef = useRef<Konva.Transformer | null>(null);
  const dragHistoryRef = useRef<{ x: number; y: number; time: number }[]>([]);

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

  const handleDragStart = (e: Konva.KonvaEventObject<DragEvent>) => {
    dragHistoryRef.current = [{ x: e.target.x(), y: e.target.y(), time: performance.now() }];
    if (localUserId) {
      onChange(object.id, {
        physics: {
          ...object.physics,
          state: 'dragging',
          authority: localUserId,
        },
      });
    }
  };

  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    const now = performance.now();
    dragHistoryRef.current.push({ x: e.target.x(), y: e.target.y(), time: now });
    if (dragHistoryRef.current.length > 5) {
      dragHistoryRef.current.shift();
    }
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const history = dragHistoryRef.current;
    let vx = 0;
    let vy = 0;

    const first = history[0];
    const last = history[history.length - 1];

    if (first && last && history.length >= 2) {
      const dt = (last.time - first.time) / 1000;
      if (dt > 0.005) {
        vx = (last.x - first.x) / dt;
        vy = (last.y - first.y) / dt;
        if (isNaN(vx)) vx = 0;
        if (isNaN(vy)) vy = 0;
      }
    }

    const speed = Math.sqrt(vx * vx + vy * vy);

    if (onThrowObject && speed > 10 && localUserId) {
      onChange(object.id, {
        x: e.target.x(),
        y: e.target.y(),
        physics: {
          ...object.physics,
          state: 'active',
          authority: localUserId,
        },
      });
      onThrowObject(object.id, { x: vx, y: vy }, { x: e.target.x(), y: e.target.y() });
    } else {
      onChange(object.id, {
        x: e.target.x(),
        y: e.target.y(),
        physics: {
          ...object.physics,
          state: 'resting',
          authority: null,
          velocity: { x: 0, y: 0 },
        },
      });
    }
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
        onDragStart={handleDragStart}
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
          anchorFill="#ffffff"
          anchorStroke="#38BDF8"
          borderStroke="#38BDF8"
          borderStrokeWidth={1.5}
        />
      )}
    </>
  );
};
