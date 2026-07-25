'use client';

import React, { useState, useEffect } from 'react';
import { Image as KonvaImage, Rect, Group, Text } from 'react-konva';
import type Konva from 'konva';
import type { CanvasObject, ImageData } from '@/types/canvas';

export interface ImageObjectProps {
  object: CanvasObject;
  isSelected: boolean;
  onSelect: (e: Konva.KonvaEventObject<any>) => void;
}

export const ImageObject: React.FC<ImageObjectProps> = ({
  object,
  isSelected,
  onSelect,
}) => {
  const data = object.data as ImageData;
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!data.src) return;
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = data.src;
    img.onload = () => {
      setImageElement(img);
    };
  }, [data.src]);

  return (
    <Group x={0} y={0} rotation={0} onClick={onSelect} onTap={onSelect}>
      {imageElement ? (
        <KonvaImage
          x={0}
          y={0}
          image={imageElement}
          width={object.width}
          height={object.height}
          opacity={data.opacity ?? object.opacity ?? 1}
          shadowColor={isSelected ? '#38BDF8' : 'rgba(0,0,0,0.3)'}
          shadowBlur={isSelected ? 12 : 6}
          stroke={isSelected ? '#38BDF8' : undefined}
          strokeWidth={isSelected ? 2 : 0}
        />
      ) : (
        <Group x={0} y={0}>
          <Rect
            x={0}
            y={0}
            width={object.width}
            height={object.height}
            fill="#1E293B"
            stroke="#475569"
            strokeWidth={1}
            cornerRadius={8}
          />
          <Text
            x={10}
            y={object.height / 2 - 8}
            width={object.width - 20}
            text="Loading Image..."
            fill="#94A3B8"
            align="center"
            fontSize={12}
          />
        </Group>
      )}
    </Group>
  );
};
