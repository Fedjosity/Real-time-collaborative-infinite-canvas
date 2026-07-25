/**
 * =============================================================================
 * Canvas Interaction Hook
 * =============================================================================
 *
 * Provides event handlers for Stage pan, zoom, pinch-zoom, and tool actions.
 * Integrates directly with `useCanvasStore`.
 *
 * @module hooks/useCanvas
 */

import { useCallback } from 'react';
import type Konva from 'konva';
import { useCanvasStore } from '@/store/canvasStore';
import { screenToWorld, zoomToPoint } from '@/lib/canvas/viewport';
import type { Position } from '@/types/canvas';

export function useCanvas() {
  const camera = useCanvasStore((state) => state.camera);
  const activeTool = useCanvasStore((state) => state.activeTool);
  const setCamera = useCanvasStore((state) => state.setCamera);
  const panBy = useCanvasStore((state) => state.panBy);
  const setZoom = useCanvasStore((state) => state.setZoom);
  const clearSelection = useCanvasStore((state) => state.clearSelection);

  /**
   * Wheel event listener for smooth cursor-centered zoom.
   */
  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();

      const stage = e.target.getStage();
      if (!stage) return;

      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      // Zoom centered at current cursor location
      const zoomFactor = e.evt.deltaY < 0 ? 1.1 : 0.9;
      const targetScale = camera.scale * zoomFactor;
      const newCamera = zoomToPoint(camera, pointer, targetScale);
      setCamera(newCamera);
    },
    [camera, setCamera]
  );

  /**
   * Convert current pointer position on Konva stage to World coordinates.
   */
  const getPointerWorldPosition = useCallback(
    (stage: Konva.Stage): Position | null => {
      const pointer = stage.getPointerPosition();
      if (!pointer) return null;
      return screenToWorld(pointer, camera);
    },
    [camera]
  );

  /**
   * Reset view to origin (0, 0) at 100% zoom.
   */
  const resetView = useCallback(() => {
    setCamera({ x: 0, y: 0, scale: 1.0 });
  }, [setCamera]);

  /**
   * Pan canvas smoothly to center on a world position.
   */
  const panToWorldPosition = useCallback(
    (worldPos: Position, stageSize: { width: number; height: number }) => {
      const targetX = stageSize.width / 2 - worldPos.x * camera.scale;
      const targetY = stageSize.height / 2 - worldPos.y * camera.scale;
      setCamera({ ...camera, x: targetX, y: targetY });
    },
    [camera, setCamera]
  );

  return {
    camera,
    activeTool,
    handleWheel,
    getPointerWorldPosition,
    resetView,
    panToWorldPosition,
    setZoom,
    clearSelection,
  };
}
