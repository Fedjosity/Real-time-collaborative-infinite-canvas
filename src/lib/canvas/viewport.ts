/**
 * =============================================================================
 * Viewport Coordinate Math
 * =============================================================================
 *
 * Provides bidirectional coordinate transformations between:
 * - World Space: Infinite 2D coordinate system where objects live
 * - Screen Space: Pixel coordinates on the user's browser viewport
 *
 * Formulas:
 *   Screen = (World - CameraOffset) * CameraScale
 *   World  = Screen / CameraScale + CameraOffset
 *
 * @module lib/canvas/viewport
 */

import type { Camera, Position, Viewport, BoundingBox } from '@/types/canvas';
import { ZOOM_LIMITS } from '@/types/canvas';
import { clamp } from '@/lib/utils/math';

/**
 * Convert a point from Screen Space (pixels) to World Space (infinite coordinates).
 *
 * @param screenPoint - Point in browser screen pixels { x, y }
 * @param camera - Current camera state { x, y, scale }
 * @returns Point in world coordinates { x, y }
 */
export function screenToWorld(screenPoint: Position, camera: Camera): Position {
  return {
    x: screenPoint.x / camera.scale + camera.x,
    y: screenPoint.y / camera.scale + camera.y,
  };
}

/**
 * Convert a point from World Space (infinite coordinates) to Screen Space (pixels).
 *
 * @param worldPoint - Point in world coordinates { x, y }
 * @param camera - Current camera state { x, y, scale }
 * @returns Point in browser screen pixels { x, y }
 */
export function worldToScreen(worldPoint: Position, camera: Camera): Position {
  return {
    x: (worldPoint.x - camera.x) * camera.scale,
    y: (worldPoint.y - camera.y) * camera.scale,
  };
}

/**
 * Compute the world-space bounding box of the currently visible screen area.
 * Used for viewport spatial culling (rbush lookup).
 *
 * @param camera - Current camera state
 * @param stageSize - Stage dimensions in screen pixels { width, height }
 * @param padding - Optional margin in world units to prevent edge flickering
 * @returns BoundingBox in world space
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
 *
 * @param scale - Target scale factor
 * @returns Clamped scale factor
 */
export function clampZoom(scale: number): number {
  return clamp(scale, ZOOM_LIMITS.MIN, ZOOM_LIMITS.MAX);
}

/**
 * Compute new camera offset when zooming toward a specific focal point
 * (such as cursor location during wheel scroll).
 *
 * @param currentCamera - Active camera state
 * @param focalScreenPoint - Cursor location in screen pixels
 * @param newScale - Target zoom scale
 * @returns Updated Camera state with adjusted offset
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

  // New camera offset ensures worldPointBefore remains under focalScreenPoint
  const newX = worldPointBefore.x - focalScreenPoint.x / clampedScale;
  const newY = worldPointBefore.y - focalScreenPoint.y / clampedScale;

  return {
    x: newX,
    y: newY,
    scale: clampedScale,
  };
}
