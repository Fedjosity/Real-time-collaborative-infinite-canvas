/**
 * =============================================================================
 * Infinite Grid Generator
 * =============================================================================
 *
 * Generates grid dots/lines for the visible canvas area based on camera scale.
 * Implements Level of Detail (LOD):
 * - Normal zoom: 40px grid spacing
 * - Zoomed out (< 0.4): 100px grid spacing (reduces dot density)
 * - Zoomed in (> 2.0): 20px grid spacing (fine detail grid)
 *
 * @module lib/canvas/grid
 */

import type { Camera, Viewport } from '@/types/canvas';
import { getVisibleBounds } from './viewport';

export interface GridDot {
  x: number;
  y: number;
  size: number;
  opacity: number;
}

export interface GridConfig {
  baseSize: number;
  dotRadius: number;
  color: string;
}

export const DEFAULT_GRID_CONFIG: GridConfig = {
  baseSize: 40,
  dotRadius: 1.5,
  color: '#475569',
};

/**
 * Determine dynamic grid spacing based on camera zoom scale (LOD).
 */
export function getGridSpacing(scale: number, baseSize = 40): number {
  if (scale < 0.35) return baseSize * 4; // 160px spacing when zoomed far out
  if (scale < 0.7) return baseSize * 2;  // 80px spacing when zoomed out
  if (scale > 2.5) return baseSize / 2;  // 20px spacing when zoomed in
  return baseSize;
}

/**
 * Calculate grid dot positions for the current visible viewport.
 *
 * @param camera - Active camera state
 * @param stageSize - Stage dimensions in screen pixels
 * @param config - Grid styling configuration
 * @returns Array of GridDot objects ready to render
 */
export function calculateVisibleGridDots(
  camera: Camera,
  stageSize: { width: number; height: number },
  config: GridConfig = DEFAULT_GRID_CONFIG
): GridDot[] {
  const bounds: Viewport = getVisibleBounds(camera, stageSize, 100);
  const spacing = getGridSpacing(camera.scale, config.baseSize);

  // Align start positions to grid spacing increments
  const startX = Math.floor(bounds.minX / spacing) * spacing;
  const startY = Math.floor(bounds.minY / spacing) * spacing;
  const endX = Math.ceil(bounds.maxX / spacing) * spacing;
  const endY = Math.ceil(bounds.maxY / spacing) * spacing;

  const dots: GridDot[] = [];

  for (let x = startX; x <= endX; x += spacing) {
    for (let y = startY; y <= endY; y += spacing) {
      // Highlight origin (0,0) or major grid intersections
      const isMajor = x === 0 && y === 0;
      dots.push({
        x,
        y,
        size: isMajor ? config.dotRadius * 2.5 : config.dotRadius,
        opacity: isMajor ? 0.8 : 0.25,
      });
    }
  }

  return dots;
}
