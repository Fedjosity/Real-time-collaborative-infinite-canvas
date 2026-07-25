'use client';

import React from 'react';
import { Rect, Circle, RegularPolygon, Star, Arrow, Line } from 'react-konva';
import type Konva from 'konva';
import type { CanvasObject, ShapeData } from '@/types/canvas';

export interface ShapeObjectProps {
  object: CanvasObject;
  isSelected: boolean;
  onSelect: (e: Konva.KonvaEventObject<any>) => void;
}

export const ShapeObject: React.FC<ShapeObjectProps> = ({
  object,
  isSelected,
  onSelect,
}) => {
  const data = object.data as ShapeData;
  const shapeType = data.shapeType || 'rectangle';

  const commonProps = {
    x: object.x,
    y: object.y,
    rotation: object.rotation,
    fill: data.fill || '#6366F1',
    stroke: isSelected ? '#38BDF8' : data.stroke || '#818CF8',
    strokeWidth: isSelected ? (data.strokeWidth || 2) + 1 : data.strokeWidth || 2,
    opacity: object.opacity ?? 1,
    onClick: onSelect,
    onTap: onSelect,
    shadowColor: isSelected ? '#38BDF8' : 'rgba(0, 0, 0, 0.3)',
    shadowBlur: isSelected ? 12 : 6,
    shadowOpacity: 0.4,
  };

  switch (shapeType) {
    case 'circle':
      return (
        <Circle
          {...commonProps}
          radius={Math.min(object.width, object.height) / 2}
          offsetX={-object.width / 2}
          offsetY={-object.height / 2}
        />
      );

    case 'triangle':
      return (
        <RegularPolygon
          {...commonProps}
          sides={3}
          radius={Math.min(object.width, object.height) / 2}
          offsetX={-object.width / 2}
          offsetY={-object.height / 2}
        />
      );

    case 'hexagon':
      return (
        <RegularPolygon
          {...commonProps}
          sides={6}
          radius={Math.min(object.width, object.height) / 2}
          offsetX={-object.width / 2}
          offsetY={-object.height / 2}
        />
      );

    case 'star':
      return (
        <Star
          {...commonProps}
          numPoints={data.numPoints || 5}
          innerRadius={Math.min(object.width, object.height) * 0.25}
          outerRadius={Math.min(object.width, object.height) * 0.5}
          offsetX={-object.width / 2}
          offsetY={-object.height / 2}
        />
      );

    case 'arrow':
      return (
        <Arrow
          {...commonProps}
          points={[0, object.height / 2, object.width, object.height / 2]}
          pointerLength={12}
          pointerWidth={12}
        />
      );

    case 'line':
      return (
        <Line
          {...commonProps}
          points={[0, 0, object.width, object.height]}
          strokeWidth={data.strokeWidth || 4}
        />
      );

    case 'rectangle':
    default:
      return (
        <Rect
          {...commonProps}
          width={object.width}
          height={object.height}
          cornerRadius={data.cornerRadius || 8}
        />
      );
  }
};
