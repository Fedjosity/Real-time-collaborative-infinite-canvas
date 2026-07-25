'use client';

import React, { useState, useEffect } from 'react';
import { Image as KonvaImage, Rect, Group } from 'react-konva';
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
    <Group x={object.x} y={object.y} rotation={object.rotation} onClick={onSelect} onTap={onSelect}>
      {imageElement ? (
        <KonvaImage
          image={imageElement}
          width={object.width}
          height={object.height}
          opacity={data.opacity ?? object.opacity ?? 1}
          shadowColor={isSelected ? '#38BDF8' : 'rgba(0,0,0,0.3)'}
          shadowBlur={isSelected ? 12 : 4}
        />
      ) : (
        /* Placeholder while image loads */
        <Rect
          width={object.width}
          height={object.height}
          fill="#1E293B"
          stroke="#475569"
          strokeWidth={1}
          dash={[4, 4]}
          cornerRadius={6}
        />
      )}
    </Group>
  );
};
