'use client';

import React, { useRef, useCallback } from 'react';
import type { CanvasObject, Camera, BoundingBox } from '@/types/canvas';
import type { User } from '@/types/room';
import { useCanvasStore } from '@/store/canvasStore';
import { screenToWorld } from '@/lib/canvas/viewport';

export interface MiniMapProps {
  objects: CanvasObject[];
  users: User[];
  width?: number;
  height?: number;
}

export const MiniMap: React.FC<MiniMapProps> = ({
  objects,
  users,
  width = 200,
  height = 140,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const camera = useCanvasStore((state) => state.camera);
  const setCamera = useCanvasStore((state) => state.setCamera);

  // Compute total bounding area enclosing all canvas objects
  const computeCanvasBounds = useCallback((): BoundingBox => {
    if (objects.length === 0) {
      return { minX: -2000, minY: -2000, maxX: 2000, maxY: 2000 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    objects.forEach((obj) => {
      minX = Math.min(minX, obj.x);
      minY = Math.min(minY, obj.y);
      maxX = Math.max(maxX, obj.x + obj.width);
      maxY = Math.max(maxY, obj.y + obj.height);
    });

    // Add padding around canvas content bounds
    const padding = 500;
    return {
      minX: Math.min(-2000, minX - padding),
      minY: Math.min(-2000, minY - padding),
      maxX: Math.max(2000, maxX + padding),
      maxY: Math.max(2000, maxY + padding),
    };
  }, [objects]);

  const bounds = computeCanvasBounds();
  const boundsWidth = bounds.maxX - bounds.minX;
  const boundsHeight = bounds.maxY - bounds.minY;

  // Scale factors to map world coordinates (x, y) into mini-map pixel dimensions
  const scaleX = width / boundsWidth;
  const scaleY = height / boundsHeight;

  // World to MiniMap coordinate conversion
  const worldToMiniMap = (x: number, y: number) => ({
    x: (x - bounds.minX) * scaleX,
    y: (y - bounds.minY) * scaleY,
  });

  // Calculate local camera viewport box on Mini-Map
  const viewportWorldTL = screenToWorld({ x: 0, y: 0 }, camera);
  const viewportWorldBR = screenToWorld(
    { x: typeof window !== 'undefined' ? window.innerWidth : 1920, y: typeof window !== 'undefined' ? window.innerHeight : 1080 },
    camera
  );

  const vpMiniTL = worldToMiniMap(viewportWorldTL.x, viewportWorldTL.y);
  const vpMiniBR = worldToMiniMap(viewportWorldBR.x, viewportWorldBR.y);

  const vpWidth = Math.max(16, vpMiniBR.x - vpMiniTL.x);
  const vpHeight = Math.max(12, vpMiniBR.y - vpMiniTL.y);

  // Handle clicking on Mini-Map to immediately pan camera center
  const handleMiniMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert click position to world coordinates
    const targetWorldX = bounds.minX + clickX / scaleX;
    const targetWorldY = bounds.minY + clickY / scaleY;

    // Center camera on target position
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;

    setCamera({
      ...camera,
      x: screenWidth / 2 - targetWorldX * camera.scale,
      y: screenHeight / 2 - targetWorldY * camera.scale,
    });
  };

  return (
    <div
      ref={containerRef}
      onClick={handleMiniMapClick}
      className="relative glass-panel bg-[#0e0e12]/95 border border-amber-500/30 shadow-2xl rounded-xl overflow-hidden cursor-pointer select-none group"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {/* Background Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

      {/* Render Canvas Objects as Simplified Rectangles */}
      {objects.map((obj) => {
        const pos = worldToMiniMap(obj.x, obj.y);
        const w = Math.max(3, obj.width * scaleX);
        const h = Math.max(3, obj.height * scaleY);
        const color = (obj.data as any)?.color || (obj.data as any)?.fill || '#D4AF37';

        return (
          <div
            key={obj.id}
            className="absolute rounded-sm pointer-events-none opacity-80"
            style={{
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              width: `${w}px`,
              height: `${h}px`,
              backgroundColor: color,
            }}
          />
        );
      })}

      {/* Render Connected Remote Peer Dots on Radar */}
      {users
        .filter((u) => !u.isLocal && u.cursor)
        .map((user) => {
          if (!user.cursor) return null;
          const pos = worldToMiniMap(user.cursor.x, user.cursor.y);

          return (
            <div
              key={user.id || user.clientId}
              className="absolute w-2.5 h-2.5 rounded-full pointer-events-none shadow-md border border-slate-950 animate-pulse"
              style={{
                left: `${pos.x - 5}px`,
                top: `${pos.y - 5}px`,
                backgroundColor: user.color || '#D4AF37',
              }}
              title={user.username}
            />
          );
        })}

      {/* Local Camera Viewport Highlight Box */}
      <div
        className="absolute border-2 border-amber-400 bg-amber-400/10 rounded pointer-events-none transition-all duration-75 shadow-gold-glow"
        style={{
          left: `${Math.max(0, Math.min(width - vpWidth, vpMiniTL.x))}px`,
          top: `${Math.max(0, Math.min(height - vpHeight, vpMiniTL.y))}px`,
          width: `${vpWidth}px`,
          height: `${vpHeight}px`,
        }}
      />

      {/* Mini-Map Header Label */}
      <div className="absolute top-1.5 left-2 text-[10px] font-bold font-mono text-amber-300/80 uppercase pointer-events-none tracking-wider">
        MINI-MAP
      </div>
    </div>
  );
};
