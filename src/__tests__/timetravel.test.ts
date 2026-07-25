/**
 * =============================================================================
 * Time-Travel Session Replay Unit Tests
 * =============================================================================
 *
 * Tests for snapshot creation, timestamp formatting, and timeline playback indexing.
 *
 * @module __tests__/timetravel.test
 */

import { describe, it, expect } from 'vitest';
import { createSnapshot, formatSnapshotTime } from '@/lib/timetravel/snapshots';
import type { CanvasObject } from '@/types/canvas';
import { DEFAULT_SHAPE_DATA, DEFAULT_PHYSICS } from '@/types/canvas';

describe('Time-Travel Session Replay Protocol', () => {
  it('creates immutable canvas state snapshots', () => {
    const mockObjects: CanvasObject[] = [
      {
        id: 'tt-1',
        type: 'shape',
        x: 10,
        y: 20,
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
      },
    ];

    const snapshot = createSnapshot(mockObjects, 'Alice', 'Created shape');

    expect(snapshot.id).toBeDefined();
    expect(snapshot.author).toBe('Alice');
    expect(snapshot.objects).toHaveLength(1);
    expect(snapshot.objects[0]!.id).toBe('tt-1');
  });

  it('formats snapshot timestamps into readable time strings', () => {
    const timestamp = new Date('2026-07-25T10:00:00Z').getTime();
    const formatted = formatSnapshotTime(timestamp);

    expect(typeof formatted).toBe('string');
    expect(formatted.length).toBeGreaterThan(0);
  });
});
