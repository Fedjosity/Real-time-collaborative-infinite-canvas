/**
 * =============================================================================
 * Object System & Factories Unit Tests
 * =============================================================================
 *
 * Tests for CanvasObject construction, default data structures, and type discrimination.
 *
 * @module __tests__/objects.test
 */

import { describe, it, expect } from 'vitest';
import type { CanvasObject, TextData, ShapeData, StickyData } from '@/types/canvas';
import {
  DEFAULT_TEXT_DATA,
  DEFAULT_SHAPE_DATA,
  DEFAULT_STICKY_DATA,
  DEFAULT_PHYSICS,
  STICKY_COLORS,
} from '@/types/canvas';
import { generateObjectId } from '@/lib/utils/id';

describe('Object Data Factories', () => {
  it('creates default text object structure', () => {
    const textData: TextData = { ...DEFAULT_TEXT_DATA, content: 'Hello World' };
    const obj: CanvasObject = {
      id: generateObjectId(),
      type: 'text',
      x: 100,
      y: 200,
      width: 200,
      height: 50,
      rotation: 0,
      data: textData,
      physics: DEFAULT_PHYSICS,
      createdBy: 'UserA',
      createdAt: Date.now(),
      zIndex: 1,
      locked: false,
      opacity: 1,
    };

    expect(obj.type).toBe('text');
    expect((obj.data as TextData).content).toBe('Hello World');
    expect(obj.physics.enabled).toBe(false);
  });

  it('creates shape object with custom properties', () => {
    const shapeData: ShapeData = {
      ...DEFAULT_SHAPE_DATA,
      shapeType: 'star',
      fill: '#EF4444',
      numPoints: 5,
    };

    const obj: CanvasObject = {
      id: generateObjectId(),
      type: 'shape',
      x: 300,
      y: 400,
      width: 150,
      height: 150,
      rotation: 45,
      data: shapeData,
      physics: { ...DEFAULT_PHYSICS, enabled: true },
      createdBy: 'UserB',
      createdAt: Date.now(),
      zIndex: 2,
      locked: false,
      opacity: 0.9,
    };

    expect(obj.type).toBe('shape');
    expect((obj.data as ShapeData).shapeType).toBe('star');
    expect(obj.physics.enabled).toBe(true);
  });

  it('contains valid sticky note palette colors', () => {
    expect(STICKY_COLORS).toContain('#FEF08A');
    expect(STICKY_COLORS).toHaveLength(8);

    const stickyData: StickyData = {
      ...DEFAULT_STICKY_DATA,
      content: 'Important Note',
      backgroundColor: STICKY_COLORS[0]!,
      author: 'Alex',
    };

    expect(stickyData.backgroundColor).toBe('#FEF08A');
    expect(stickyData.author).toBe('Alex');
  });
});
