"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import type { CanvasObject, Camera, BoundingBox } from "@/types/canvas";
import type { User } from "@/types/room";
import { useCanvasStore } from "@/store/canvasStore";
import { screenToWorld } from "@/lib/canvas/viewport";

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
  const [mounted, setMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const camera = useCanvasStore((state) => state.camera);
  const setCamera = useCanvasStore((state) => state.setCamera);

  useEffect(() => {
    setMounted(true);
  }, []);

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

    const padding = 500;
    return {
      minX: Math.min(-2000, minX - padding),
      minY: Math.min(-2000, minY - padding),
      maxX: Math.max(2000, maxX + padding),
      maxY: Math.max(2000, maxY + padding),
    };
  }, [objects]);

  if (!mounted) {
    return (
      <div
        className="bg-white/90 backdrop-blur-md border border-[#bfc7d5] shadow-lg rounded-xl"
        style={{ width: `${width}px`, height: `${height}px` }}
      />
    );
  }

  const bounds = computeCanvasBounds();
  const boundsWidth = bounds.maxX - bounds.minX;
  const boundsHeight = bounds.maxY - bounds.minY;

  const scaleX = width / boundsWidth;
  const scaleY = height / boundsHeight;

  const worldToMiniMap = (x: number, y: number) => ({
    x: (x - bounds.minX) * scaleX,
    y: (y - bounds.minY) * scaleY,
  });

  const viewportWorldTL = screenToWorld({ x: 0, y: 0 }, camera);
  const viewportWorldBR = screenToWorld(
    { x: window.innerWidth, y: window.innerHeight },
    camera,
  );

  const vpMiniTL = worldToMiniMap(viewportWorldTL.x, viewportWorldTL.y);
  const vpMiniBR = worldToMiniMap(viewportWorldBR.x, viewportWorldBR.y);

  const vpWidth = Math.max(16, vpMiniBR.x - vpMiniTL.x);
  const vpHeight = Math.max(12, vpMiniBR.y - vpMiniTL.y);

  const updateCameraFromMiniMap = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(width, clientX - rect.left));
    const clickY = Math.max(0, Math.min(height, clientY - rect.top));

    const targetWorldX = bounds.minX + clickX / scaleX;
    const targetWorldY = bounds.minY + clickY / scaleY;

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    setCamera({
      ...camera,
      x: screenWidth / 2 - targetWorldX * camera.scale,
      y: screenHeight / 2 - targetWorldY * camera.scale,
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    updateCameraFromMiniMap(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      updateCameraFromMiniMap(e.clientX, e.clientY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="relative bg-white/90 backdrop-blur-md border border-[#bfc7d5] shadow-lg rounded-xl overflow-hidden cursor-crosshair select-none group"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {/* Background Grid */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, #0061a5 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />

      {/* Render Canvas Objects as Simplified Rectangles */}
      {objects.map((obj) => {
        const pos = worldToMiniMap(obj.x, obj.y);
        const w = Math.max(3, obj.width * scaleX);
        const h = Math.max(3, obj.height * scaleY);
        const color =
          (obj.data as any)?.color || (obj.data as any)?.fill || "#0d99ff";

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
              className="absolute w-2.5 h-2.5 rounded-full pointer-events-none shadow-md border border-on-surface animate-pulse"
              style={{
                left: `${pos.x - 5}px`,
                top: `${pos.y - 5}px`,
                backgroundColor: user.color || "#0d99ff",
              }}
              title={user.username}
            />
          );
        })}

      {/* Viewport Indicator */}
      <div
        className="absolute border-2 border-[#0061a5] bg-[#0061a5]/10 rounded-sm pointer-events-none transition-all duration-75 ease-out shadow-sm"
        style={{
          left: `${Math.max(0, Math.min(width - vpWidth, vpMiniTL.x))}px`,
          top: `${Math.max(0, Math.min(height - vpHeight, vpMiniTL.y))}px`,
          width: `${vpWidth}px`,
          height: `${vpHeight}px`,
        }}
      />
    </div>
  );
};
