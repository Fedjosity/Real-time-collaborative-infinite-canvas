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
import { DEFAULT_PHYSICS, DEFAULT_SHAPE_DATA } from '@/types/canvas';

describe('Viewport Math', () => {
  const camera = { x: 100, y: 50, scale: 2.0 };

  it('converts screen coordinates to world coordinates', () => {
    // screenToWorld: screen / scale + cameraPos
    // x: 200 / 2.0 + 100 = 200
    // y: 100 / 2.0 + 50 = 100
    const world = screenToWorld({ x: 200, y: 100 }, camera);
    expect(world).toEqual({ x: 200, y: 100 });
  });

  it('converts world coordinates to screen coordinates', () => {
    // worldToScreen: (world - cameraPos) * scale
    // x: (200 - 100) * 2 = 200
    // y: (100 - 50) * 2 = 100
    const screen = worldToScreen({ x: 200, y: 100 }, camera);
    expect(screen).toEqual({ x: 200, y: 100 });
  });

  it('computes visible bounds for spatial culling', () => {
    const bounds = getVisibleBounds(camera, { width: 1000, height: 600 }, 0);
    expect(bounds.minX).toBe(100);
    expect(bounds.minY).toBe(50);
    expect(bounds.maxX).toBe(600); // 1000 / 2 + 100
    expect(bounds.maxY).toBe(350); // 600 / 2 + 50
  });

  it('zooms to focal point accurately', () => {
    const focalScreen = { x: 500, y: 300 };
    const newCamera = zoomToPoint({ x: 0, y: 0, scale: 1.0 }, focalScreen, 2.0);

    expect(newCamera.scale).toBe(2.0);
    // Point under cursor before zoom (500, 300) should remain under cursor after zoom
    const worldAfter = screenToWorld(focalScreen, newCamera);
    expect(worldAfter).toEqual({ x: 500, y: 300 });
  });
});

describe('Spatial Index (rbush R-Tree)', () => {
  const index = new CanvasSpatialIndex();

  const mockObject1: CanvasObject = {
    id: 'obj-1',
    type: 'shape',
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    rotation: 0,
    data: DEFAULT_SHAPE_DATA,
    physics: DEFAULT_PHYSICS,
    createdBy: 'Alice',
    createdAt: Date.now(),
    zIndex: 1,
    locked: false,
    opacity: 1,
  };

  const mockObject2: CanvasObject = {
    id: 'obj-2',
    type: 'shape',
    x: 500,
    y: 500,
    width: 100,
    height: 100,
    rotation: 0,
    data: DEFAULT_SHAPE_DATA,
    physics: DEFAULT_PHYSICS,
    createdBy: 'Bob',
    createdAt: Date.now(),
    zIndex: 2,
    locked: false,
    opacity: 1,
  };

  it('inserts objects and queries viewport intersection', () => {
    index.rebuild([mockObject1, mockObject2]);

    // Viewport containing only obj-1
    const view1 = index.search({ minX: -10, minY: -10, maxX: 200, maxY: 200 });
    expect(view1).toHaveLength(1);
    expect(view1[0]?.id).toBe('obj-1');

    // Viewport containing only obj-2
    const view2 = index.search({ minX: 400, minY: 400, maxX: 700, maxY: 700 });
    expect(view2).toHaveLength(1);
    expect(view2[0]?.id).toBe('obj-2');

    // Viewport containing both objects
    const viewAll = index.search({ minX: -100, minY: -100, maxX: 1000, maxY: 1000 });
    expect(viewAll).toHaveLength(2);
  });

  it('retrieves top-most object under cursor point', () => {
    index.rebuild([mockObject1]);
    const hit = index.getObjectAtPoint({ x: 50, y: 50 });
    expect(hit?.id).toBe('obj-1');

    const miss = index.getObjectAtPoint({ x: 999, y: 999 });
    expect(miss).toBeNull();
  });
});
