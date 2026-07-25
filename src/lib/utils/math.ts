/**
 * =============================================================================
 * Math & Geometry Utilities
 * =============================================================================
 *
 * Helper functions for coordinate transforms, distance calculations,
 * bounding box operations, and other geometric computations needed
 * by the canvas, physics, and spatial indexing systems.
 *
 * @module lib/utils/math
 */

import type { Position, BoundingBox } from '@/types/canvas';

// ─── Coordinate Transforms ─────────────────────────────────────────────────

/**
 * Clamp a value between a minimum and maximum.
 *
 * @param value - The value to clamp
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns The clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values.
 * Useful for smooth cursor animations and camera transitions.
 *
 * @param start - Start value
 * @param end - End value
 * @param t - Interpolation factor (0 = start, 1 = end)
 * @returns Interpolated value
 *
 * @example
 * lerp(0, 100, 0.5) // 50
 * lerp(0, 100, 0.25) // 25
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * 2D linear interpolation between two positions.
 *
 * @param a - Start position
 * @param b - End position
 * @param t - Interpolation factor (0-1)
 * @returns Interpolated position
 */
export function lerpPosition(a: Position, b: Position, t: number): Position {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
  };
}

// ─── Distance & Angles ──────────────────────────────────────────────────────

/**
 * Calculate Euclidean distance between two points.
 *
 * @param a - First point
 * @param b - Second point
 * @returns Distance in world units
 */
export function distance(a: Position, b: Position): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate squared distance between two points.
 * Faster than `distance()` when you only need to compare distances
 * (avoids the expensive sqrt operation).
 *
 * @param a - First point
 * @param b - Second point
 * @returns Squared distance
 */
export function distanceSquared(a: Position, b: Position): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return dx * dx + dy * dy;
}

/**
 * Calculate the angle (in radians) from point A to point B.
 *
 * @param a - Origin point
 * @param b - Target point
 * @returns Angle in radians
 */
export function angleBetween(a: Position, b: Position): number {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

/**
 * Convert degrees to radians.
 */
export function degToRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees.
 */
export function radToDeg(radians: number): number {
  return radians * (180 / Math.PI);
}

// ─── Bounding Box Operations ────────────────────────────────────────────────

/**
 * Create a bounding box from position and size.
 *
 * @param x - Top-left X coordinate
 * @param y - Top-left Y coordinate
 * @param width - Width
 * @param height - Height
 * @returns Axis-aligned bounding box
 */
export function createBoundingBox(
  x: number,
  y: number,
  width: number,
  height: number
): BoundingBox {
  return {
    minX: x,
    minY: y,
    maxX: x + width,
    maxY: y + height,
  };
}

/**
 * Check if two bounding boxes overlap (intersect).
 *
 * @param a - First bounding box
 * @param b - Second bounding box
 * @returns True if the boxes overlap
 */
export function boxesOverlap(a: BoundingBox, b: BoundingBox): boolean {
  return (
    a.minX <= b.maxX &&
    a.maxX >= b.minX &&
    a.minY <= b.maxY &&
    a.maxY >= b.minY
  );
}

/**
 * Check if bounding box A fully contains bounding box B.
 *
 * @param outer - The containing box
 * @param inner - The box to test
 * @returns True if `inner` is entirely within `outer`
 */
export function boxContains(outer: BoundingBox, inner: BoundingBox): boolean {
  return (
    outer.minX <= inner.minX &&
    outer.minY <= inner.minY &&
    outer.maxX >= inner.maxX &&
    outer.maxY >= inner.maxY
  );
}

/**
 * Check if a point is inside a bounding box.
 *
 * @param box - The bounding box
 * @param point - The point to test
 * @returns True if the point is inside the box
 */
export function pointInBox(box: BoundingBox, point: Position): boolean {
  return (
    point.x >= box.minX &&
    point.x <= box.maxX &&
    point.y >= box.minY &&
    point.y <= box.maxY
  );
}

/**
 * Expand a bounding box by a margin on all sides.
 * Useful for adding padding to viewport queries.
 *
 * @param box - The original bounding box
 * @param margin - Margin to add on each side
 * @returns Expanded bounding box
 */
export function expandBox(box: BoundingBox, margin: number): BoundingBox {
  return {
    minX: box.minX - margin,
    minY: box.minY - margin,
    maxX: box.maxX + margin,
    maxY: box.maxY + margin,
  };
}

/**
 * Calculate the union (encompassing box) of multiple bounding boxes.
 * Returns null if the array is empty.
 *
 * @param boxes - Array of bounding boxes
 * @returns The smallest box containing all input boxes, or null
 */
export function unionBoxes(boxes: BoundingBox[]): BoundingBox | null {
  if (boxes.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const box of boxes) {
    minX = Math.min(minX, box.minX);
    minY = Math.min(minY, box.minY);
    maxX = Math.max(maxX, box.maxX);
    maxY = Math.max(maxY, box.maxY);
  }

  return { minX, minY, maxX, maxY };
}

// ─── Vector Operations ──────────────────────────────────────────────────────

/**
 * Normalize a vector to unit length.
 * Returns { x: 0, y: 0 } for zero-length vectors.
 *
 * @param v - The vector to normalize
 * @returns Unit vector in the same direction
 */
export function normalize(v: Position): Position {
  const len = Math.sqrt(v.x * v.x + v.y * v.y);
  if (len === 0) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
}

/**
 * Scale a vector by a scalar value.
 *
 * @param v - The vector
 * @param scalar - Scale factor
 * @returns Scaled vector
 */
export function scale(v: Position, scalar: number): Position {
  return { x: v.x * scalar, y: v.y * scalar };
}

/**
 * Add two vectors.
 */
export function addVectors(a: Position, b: Position): Position {
  return { x: a.x + b.x, y: a.y + b.y };
}

/**
 * Subtract vector B from vector A.
 */
export function subtractVectors(a: Position, b: Position): Position {
  return { x: a.x - b.x, y: a.y - b.y };
}

/**
 * Calculate the magnitude (length) of a vector.
 */
export function magnitude(v: Position): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

// ─── Snap & Grid ────────────────────────────────────────────────────────────

/**
 * Snap a value to the nearest grid increment.
 *
 * @param value - The value to snap
 * @param gridSize - Grid increment size
 * @returns Snapped value
 *
 * @example
 * snapToGrid(37, 10) // 40
 * snapToGrid(33, 10) // 30
 */
export function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

/**
 * Snap a position to the nearest grid point.
 *
 * @param pos - Position to snap
 * @param gridSize - Grid increment size
 * @returns Snapped position
 */
export function snapPositionToGrid(
  pos: Position,
  gridSize: number
): Position {
  return {
    x: snapToGrid(pos.x, gridSize),
    y: snapToGrid(pos.y, gridSize),
  };
}
