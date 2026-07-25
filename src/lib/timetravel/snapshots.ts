/**
 * =============================================================================
 * Time-Travel Session Replay Protocol & Snapshot Management
 * =============================================================================
 *
 * Records historical canvas state snapshots into CRDT history:
 * - Snapshot payload: { timestamp, objects, author, description }
 * - Timeline playback & restoration math
 *
 * @module lib/timetravel/snapshots
 */

import type { CanvasObject } from '@/types/canvas';

export interface CanvasSnapshot {
  id: string;
  timestamp: number;
  author: string;
  description: string;
  objects: CanvasObject[];
}

/**
 * Create a new immutable snapshot of the canvas state.
 */
export function createSnapshot(
  objects: CanvasObject[],
  author = 'System',
  description = 'Canvas State Edit'
): CanvasSnapshot {
  return {
    id: `snap_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    timestamp: Date.now(),
    author,
    description,
    // Deep clone object list to decouple from live state mutations
    objects: JSON.parse(JSON.stringify(objects)),
  };
}

/**
 * Format timestamp into readable time string (e.g. "10:45:12 AM").
 */
export function formatSnapshotTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
