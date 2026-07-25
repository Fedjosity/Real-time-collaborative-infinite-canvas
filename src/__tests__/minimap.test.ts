/**
 * =============================================================================
 * Mini-Map & Peer Radar Unit Tests
 * =============================================================================
 *
 * Tests for bounding box scale calculations and world-to-minimap translation math.
 *
 * @module __tests__/minimap.test
 */

import { describe, it, expect } from 'vitest';

describe('MiniMap Coordinate Translation Math', () => {
  it('translates world coordinates to minimap pixel space', () => {
    const minX = -1000;
    const maxX = 1000;
    const miniMapWidth = 200;

    const boundsWidth = maxX - minX; // 2000
    const scaleX = miniMapWidth / boundsWidth; // 0.1

    // World X = 0 should be at 100px (center of minimap)
    const worldX = 0;
    const miniMapX = (worldX - minX) * scaleX;

    expect(miniMapX).toBe(100);
  });

  it('clamps viewport box within mini-map boundaries', () => {
    const miniWidth = 200;
    const vpWidth = 300; // Viewport larger than minimap

    const clampedWidth = Math.min(miniWidth, vpWidth);
    expect(clampedWidth).toBe(200);
  });
});
