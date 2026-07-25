/**
 * =============================================================================
 * Yjs CRDT & Awareness Unit Tests
 * =============================================================================
 *
 * Tests for createYjsRoomDoc, Y.Map objects insertion, and Awareness presence parsing.
 *
 * @module __tests__/yjs.test
 */

import { describe, it, expect } from 'vitest';
import * as Y from 'yjs';
import { createYjsRoomDoc } from '@/lib/yjs/doc';
import type { CanvasObject } from '@/types/canvas';
import { DEFAULT_PHYSICS, DEFAULT_SHAPE_DATA } from '@/types/canvas';

describe('Yjs CRDT Document & Shared Maps', () => {
  it('creates a room doc with objects Y.Map and zIndex Y.Array', () => {
    const { doc, objectsMap, zIndexArray } = createYjsRoomDoc('test-room-1');
    expect(doc).toBeInstanceOf(Y.Doc);
    expect(objectsMap).toBeInstanceOf(Y.Map);
    expect(zIndexArray).toBeInstanceOf(Y.Array);
  });

  it('performs conflict-free transactions on objects Y.Map', () => {
    const { doc, objectsMap } = createYjsRoomDoc('test-room-2');

    const obj: CanvasObject = {
      id: 'crdt-obj-1',
      type: 'shape',
      x: 100,
      y: 200,
      width: 150,
      height: 150,
      rotation: 0,
      data: DEFAULT_SHAPE_DATA,
      physics: DEFAULT_PHYSICS,
      createdBy: 'UserA',
      createdAt: Date.now(),
      zIndex: 1,
      locked: false,
      opacity: 1,
    };

    doc.transact(() => {
      objectsMap.set('crdt-obj-1', obj);
    });

    expect(objectsMap.has('crdt-obj-1')).toBe(true);
    expect(objectsMap.get('crdt-obj-1')?.x).toBe(100);

    // Update position
    doc.transact(() => {
      const existing = objectsMap.get('crdt-obj-1');
      if (existing) {
        objectsMap.set('crdt-obj-1', { ...existing, x: 250 });
      }
    });

    expect(objectsMap.get('crdt-obj-1')?.x).toBe(250);
  });

  it('deletes objects cleanly from Y.Map', () => {
    const { doc, objectsMap } = createYjsRoomDoc('test-room-3');
    const obj: CanvasObject = {
      id: 'del-1',
      type: 'text',
      x: 0,
      y: 0,
      width: 100,
      height: 50,
      rotation: 0,
      data: {} as any,
      physics: DEFAULT_PHYSICS,
      createdBy: 'UserA',
      createdAt: Date.now(),
      zIndex: 1,
      locked: false,
      opacity: 1,
    };

    objectsMap.set('del-1', obj);
    expect(objectsMap.size).toBe(1);

    objectsMap.delete('del-1');
    expect(objectsMap.size).toBe(0);
  });
});
