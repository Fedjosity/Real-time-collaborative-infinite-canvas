/**
 * =============================================================================
 * Viewport & Spatial Index Unit Tests
 * =============================================================================
 *
 * Tests screenToWorld, worldToScreen, zoomToPoint, and CanvasSpatialIndex (rbush).
 *
 * @module __tests__/canvas.test
 */

import { describe, it, expect } from 'vitest';
import {
  screenToWorld,
  worldToScreen,
  getVisibleBounds,
  zoomToPoint,
} from '@/lib/canvas/viewport';
import { CanvasSpatialIndex } from '@/lib/canvas/spatial-index';
import type { CanvasObject } from '@/types/canvas';
import { DEFAULT_PHYSICS, DEFAULT_SHAPE_DATA, DEFAULT_TEXT_DATA } from '@/types/canvas';

describe('Viewport Math', () => {
  const camera = { x: 100, y: 50, scale: 2.0 };

  it('converts screen coordinates to world coordinates', () => {
    // screenToWorld: (screen - cameraPos) / scale
    // x: (200 - 100) / 2.0 = 50
    // y: (100 - 50) / 2.0 = 25
    const world = screenToWorld({ x: 200, y: 100 }, camera);
    expect(world).toEqual({ x: 50, y: 25 });
  });

  it('converts world coordinates to screen coordinates', () => {
    // worldToScreen: world * scale + cameraPos
    // x: 200 * 2.0 + 100 = 500
    // y: 100 * 2.0 + 50 = 250
    const screen = worldToScreen({ x: 200, y: 100 }, camera);
    expect(screen).toEqual({ x: 500, y: 250 });
  });

  it('computes visible bounds for spatial culling', () => {
    const bounds = getVisibleBounds(camera, { width: 1000, height: 600 }, 0);
    expect(bounds.minX).toBe(-50);
    expect(bounds.minY).toBe(-25);
    expect(bounds.maxX).toBe(450);
    expect(bounds.maxY).toBe(275);
  });

  it('zooms to focal point accurately', () => {
    const focalScreen = { x: 500, y: 300 };
    const newCamera = zoomToPoint(camera, focalScreen, 3.0);
    expect(newCamera.scale).toBe(3.0);

    // Verify focal point remains at the same screen position before and after zoom
    const worldBefore = screenToWorld(focalScreen, camera);
    const screenAfter = worldToScreen(worldBefore, newCamera);
    expect(Math.round(screenAfter.x)).toBe(focalScreen.x);
    expect(Math.round(screenAfter.y)).toBe(focalScreen.y);
  });
});

describe('Spatial Index (rbush R-Tree)', () => {
  const index = new CanvasSpatialIndex();

  const mockObjects: CanvasObject[] = [
    {
      id: 'obj-1',
      type: 'shape',
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      rotation: 0,
      data: DEFAULT_SHAPE_DATA,
      physics: DEFAULT_PHYSICS,
      createdBy: 'UserA',
      createdAt: Date.now(),
      zIndex: 1,
      locked: false,
      opacity: 1,
    },
    {
      id: 'obj-2',
      type: 'text',
      x: 500,
      y: 500,
      width: 200,
      height: 50,
      rotation: 0,
      data: DEFAULT_TEXT_DATA,
      physics: DEFAULT_PHYSICS,
      createdBy: 'UserB',
      createdAt: Date.now(),
      zIndex: 2,
      locked: false,
      opacity: 1,
    },
  ];

  it('inserts objects and queries viewport intersection', () => {
    index.rebuild(mockObjects);

    const visible = index.search({
      minX: -50,
      minY: -50,
      maxX: 150,
      maxY: 150,
    });

    expect(visible).toHaveLength(1);
    expect(visible[0]?.id).toBe('obj-1');
  });

  it('retrieves top-most object under cursor point', () => {
    index.rebuild(mockObjects);

    const target = index.getObjectAtPoint({ x: 50, y: 50 });
    expect(target?.id).toBe('obj-1');

    const miss = index.getObjectAtPoint({ x: 2000, y: 2000 });
    expect(miss).toBeNull();
  });
});
