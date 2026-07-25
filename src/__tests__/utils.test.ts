/**
 * =============================================================================
 * Utility Tests
 * =============================================================================
 *
 * Unit tests for the core utility modules: ID generation, colors, and math.
 * These are the foundational building blocks used across the entire app.
 *
 * @module __tests__/utils.test
 */

import { describe, it, expect } from 'vitest';
import { generateObjectId, generateRoomId, generateDeviceId } from '@/lib/utils/id';
import {
  getUserColor,
  getRandomUserColor,
  hexToRgba,
  getContrastTextColor,
  lightenColor,
  USER_COLORS,
} from '@/lib/utils/colors';
import {
  clamp,
  lerp,
  lerpPosition,
  distance,
  distanceSquared,
  degToRad,
  radToDeg,
  createBoundingBox,
  boxesOverlap,
  boxContains,
  pointInBox,
  expandBox,
  unionBoxes,
  normalize,
  snapToGrid,
  snapPositionToGrid,
  addVectors,
  subtractVectors,
  magnitude,
} from '@/lib/utils/math';

// ─── ID Generation ──────────────────────────────────────────────────────────

describe('ID Generation', () => {
  it('generates object IDs with correct length', () => {
    const id = generateObjectId();
    expect(id).toHaveLength(12);
    expect(typeof id).toBe('string');
  });

  it('generates room IDs with correct length', () => {
    const id = generateRoomId();
    expect(id).toHaveLength(10);
  });

  it('generates device IDs with correct length', () => {
    const id = generateDeviceId();
    expect(id).toHaveLength(21);
  });

  it('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 1000 }, () => generateObjectId()));
    expect(ids.size).toBe(1000);
  });

  it('generates URL-safe characters only', () => {
    const id = generateObjectId();
    // nanoid uses A-Za-z0-9_- by default
    expect(id).toMatch(/^[A-Za-z0-9_-]+$/);
  });
});

// ─── Color Utilities ────────────────────────────────────────────────────────

describe('Color Utilities', () => {
  it('returns a color for any user index', () => {
    expect(getUserColor(0)).toBe(USER_COLORS[0]);
    expect(getUserColor(5)).toBe(USER_COLORS[5]);
  });

  it('wraps around when index exceeds palette length', () => {
    const color = getUserColor(USER_COLORS.length);
    expect(color).toBe(USER_COLORS[0]);
  });

  it('returns a random user color from the palette', () => {
    const color = getRandomUserColor();
    expect(USER_COLORS).toContain(color);
  });

  it('converts hex to rgba correctly', () => {
    expect(hexToRgba('#FF0000', 0.5)).toBe('rgba(255, 0, 0, 0.5)');
    expect(hexToRgba('#00FF00', 1)).toBe('rgba(0, 255, 0, 1)');
    expect(hexToRgba('000000', 0)).toBe('rgba(0, 0, 0, 0)');
  });

  it('determines correct contrast text color', () => {
    // White background → dark text
    expect(getContrastTextColor('#FFFFFF')).toBe('#0F172A');
    // Black background → white text
    expect(getContrastTextColor('#000000')).toBe('#FFFFFF');
    // Yellow background → dark text
    expect(getContrastTextColor('#FEF08A')).toBe('#0F172A');
    // Dark blue background → white text
    expect(getContrastTextColor('#1E3A5F')).toBe('#FFFFFF');
  });

  it('lightens colors correctly', () => {
    const lightened = lightenColor('#000000', 50);
    // #000000 lightened 50% should be approximately #808080
    expect(lightened).toBe('#808080');
  });
});

// ─── Math Utilities ─────────────────────────────────────────────────────────

describe('Math Utilities', () => {
  describe('clamp', () => {
    it('clamps values within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it('handles edge cases', () => {
      expect(clamp(0, 0, 0)).toBe(0);
      expect(clamp(0, 0, 10)).toBe(0);
      expect(clamp(10, 0, 10)).toBe(10);
    });
  });

  describe('lerp', () => {
    it('interpolates between values', () => {
      expect(lerp(0, 100, 0)).toBe(0);
      expect(lerp(0, 100, 0.5)).toBe(50);
      expect(lerp(0, 100, 1)).toBe(100);
      expect(lerp(0, 100, 0.25)).toBe(25);
    });
  });

  describe('lerpPosition', () => {
    it('interpolates between 2D positions', () => {
      const result = lerpPosition({ x: 0, y: 0 }, { x: 100, y: 200 }, 0.5);
      expect(result.x).toBe(50);
      expect(result.y).toBe(100);
    });
  });

  describe('distance', () => {
    it('calculates Euclidean distance', () => {
      expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
      expect(distance({ x: 0, y: 0 }, { x: 0, y: 0 })).toBe(0);
    });
  });

  describe('distanceSquared', () => {
    it('calculates squared distance without sqrt', () => {
      expect(distanceSquared({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(25);
    });
  });

  describe('angle conversions', () => {
    it('converts degrees to radians', () => {
      expect(degToRad(180)).toBeCloseTo(Math.PI);
      expect(degToRad(90)).toBeCloseTo(Math.PI / 2);
      expect(degToRad(0)).toBe(0);
    });

    it('converts radians to degrees', () => {
      expect(radToDeg(Math.PI)).toBeCloseTo(180);
      expect(radToDeg(Math.PI / 2)).toBeCloseTo(90);
    });
  });
});

// ─── Bounding Box Operations ────────────────────────────────────────────────

describe('Bounding Box Operations', () => {
  describe('createBoundingBox', () => {
    it('creates a bounding box from position and size', () => {
      const box = createBoundingBox(10, 20, 100, 50);
      expect(box).toEqual({ minX: 10, minY: 20, maxX: 110, maxY: 70 });
    });
  });

  describe('boxesOverlap', () => {
    it('detects overlapping boxes', () => {
      const a = createBoundingBox(0, 0, 100, 100);
      const b = createBoundingBox(50, 50, 100, 100);
      expect(boxesOverlap(a, b)).toBe(true);
    });

    it('detects non-overlapping boxes', () => {
      const a = createBoundingBox(0, 0, 50, 50);
      const b = createBoundingBox(100, 100, 50, 50);
      expect(boxesOverlap(a, b)).toBe(false);
    });

    it('detects edge-touching boxes as overlapping', () => {
      const a = createBoundingBox(0, 0, 50, 50);
      const b = createBoundingBox(50, 0, 50, 50);
      expect(boxesOverlap(a, b)).toBe(true);
    });
  });

  describe('boxContains', () => {
    it('detects when outer fully contains inner', () => {
      const outer = createBoundingBox(0, 0, 200, 200);
      const inner = createBoundingBox(50, 50, 50, 50);
      expect(boxContains(outer, inner)).toBe(true);
    });

    it('detects when outer does not contain inner', () => {
      const outer = createBoundingBox(0, 0, 50, 50);
      const inner = createBoundingBox(25, 25, 50, 50);
      expect(boxContains(outer, inner)).toBe(false);
    });
  });

  describe('pointInBox', () => {
    it('detects points inside the box', () => {
      const box = createBoundingBox(0, 0, 100, 100);
      expect(pointInBox(box, { x: 50, y: 50 })).toBe(true);
      expect(pointInBox(box, { x: 0, y: 0 })).toBe(true);
    });

    it('detects points outside the box', () => {
      const box = createBoundingBox(0, 0, 100, 100);
      expect(pointInBox(box, { x: 150, y: 50 })).toBe(false);
      expect(pointInBox(box, { x: -1, y: 50 })).toBe(false);
    });
  });

  describe('expandBox', () => {
    it('expands a box by a margin', () => {
      const box = createBoundingBox(10, 10, 80, 80);
      const expanded = expandBox(box, 5);
      expect(expanded).toEqual({ minX: 5, minY: 5, maxX: 95, maxY: 95 });
    });
  });

  describe('unionBoxes', () => {
    it('calculates the union of multiple boxes', () => {
      const boxes = [
        createBoundingBox(0, 0, 50, 50),
        createBoundingBox(100, 100, 50, 50),
      ];
      const result = unionBoxes(boxes);
      expect(result).toEqual({ minX: 0, minY: 0, maxX: 150, maxY: 150 });
    });

    it('returns null for empty array', () => {
      expect(unionBoxes([])).toBeNull();
    });
  });
});

// ─── Vector Operations ──────────────────────────────────────────────────────

describe('Vector Operations', () => {
  it('normalizes a vector to unit length', () => {
    const result = normalize({ x: 3, y: 4 });
    expect(result.x).toBeCloseTo(0.6);
    expect(result.y).toBeCloseTo(0.8);
  });

  it('handles zero vector normalization', () => {
    const result = normalize({ x: 0, y: 0 });
    expect(result).toEqual({ x: 0, y: 0 });
  });

  it('adds vectors correctly', () => {
    expect(addVectors({ x: 1, y: 2 }, { x: 3, y: 4 })).toEqual({ x: 4, y: 6 });
  });

  it('subtracts vectors correctly', () => {
    expect(subtractVectors({ x: 5, y: 7 }, { x: 2, y: 3 })).toEqual({ x: 3, y: 4 });
  });

  it('calculates vector magnitude', () => {
    expect(magnitude({ x: 3, y: 4 })).toBe(5);
    expect(magnitude({ x: 0, y: 0 })).toBe(0);
  });
});

// ─── Grid Snapping ──────────────────────────────────────────────────────────

describe('Grid Snapping', () => {
  it('snaps values to nearest grid increment', () => {
    expect(snapToGrid(37, 10)).toBe(40);
    expect(snapToGrid(33, 10)).toBe(30);
    expect(snapToGrid(35, 10)).toBe(40); // Rounds up at midpoint
    expect(snapToGrid(0, 10)).toBe(0);
  });

  it('snaps positions to nearest grid point', () => {
    const result = snapPositionToGrid({ x: 37, y: 73 }, 10);
    expect(result).toEqual({ x: 40, y: 70 });
  });
});
