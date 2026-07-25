/**
 * =============================================================================
 * Viewport Coordinate Math
 * =============================================================================
 *
 * Provides bidirectional coordinate transformations between:
 * - World Space: Infinite 2D coordinate system where objects live
 * - Screen Space: Pixel coordinates on the user's browser viewport
 *
 * Konva Stage Transformation Formula:
 *   Screen = (World * CameraScale) + CameraOffset
 *   World  = (Screen - CameraOffset) / CameraScale
 *
 * @module lib/canvas/viewport
 */

import type { Camera, Position, Viewport, BoundingBox } from '@/types/canvas';
import { ZOOM_LIMITS } from '@/types/canvas';
import { clamp } from '@/lib/utils/math';

/**
 * Convert a point from Screen Space (pixels) to World Space (infinite coordinates).
 */
export function screenToWorld(screenPoint: Position, camera: Camera): Position {
  return {
    x: (screenPoint.x - camera.x) / camera.scale,
    y: (screenPoint.y - camera.y) / camera.scale,
  };
}

/**
 * Convert a point from World Space (infinite coordinates) to Screen Space (pixels).
 */
export function worldToScreen(worldPoint: Position, camera: Camera): Position {
  return {
    x: worldPoint.x * camera.scale + camera.x,
    y: worldPoint.y * camera.scale + camera.y,
  };
}

/**
 * Compute the world-space bounding box of the currently visible screen area.
 */
export function getVisibleBounds(
  camera: Camera,
  stageSize: { width: number; height: number },
  padding = 50
): Viewport {
  const topLeft = screenToWorld({ x: 0, y: 0 }, camera);
  const bottomRight = screenToWorld(
    { x: stageSize.width, y: stageSize.height },
    camera
  );

  const minX = topLeft.x - padding;
  const minY = topLeft.y - padding;
  const maxX = bottomRight.x + padding;
  const maxY = bottomRight.y + padding;

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Clamp zoom scale to supported MIN and MAX zoom limits.
 */
export function clampZoom(scale: number): number {
  return clamp(scale, ZOOM_LIMITS.MIN, ZOOM_LIMITS.MAX);
}

/**
 * Compute new camera offset when zooming toward a specific focal point
 * (such as cursor location during wheel scroll).
 */
export function zoomToPoint(
  currentCamera: Camera,
  focalScreenPoint: Position,
  newScale: number
): Camera {
  const clampedScale = clampZoom(newScale);
  if (clampedScale === currentCamera.scale) return currentCamera;

  // Find world position under cursor before zoom
  const worldPointBefore = screenToWorld(focalScreenPoint, currentCamera);

  // New camera offset ensures worldPointBefore remains at focalScreenPoint after scaling
  const newX = focalScreenPoint.x - worldPointBefore.x * clampedScale;
  const newY = focalScreenPoint.y - worldPointBefore.y * clampedScale;

  return {
    x: newX,
    y: newY,
    scale: clampedScale,
  };
}
