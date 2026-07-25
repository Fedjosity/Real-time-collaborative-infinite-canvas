/**
 * =============================================================================
 * Yjs Document Factory & Shared Types Setup
 * =============================================================================
 *
 * Configures the Yjs CRDT Y.Doc structure for a collaborative room.
 * Shared Collections:
 * - `objects`: Y.Map<CanvasObject> — Keyed by object ID (conflict-free properties)
 * - `zIndexOrder`: Y.Array<string> — Z-index ordering of object IDs
 * - `snapshots`: Y.Array<any> — Time-travel session replay snapshots
 * - `roomMeta`: Y.Map<any> — Global room settings (e.g. physicsEnabled)
 *
 * @module lib/yjs/doc
 */

import * as Y from 'yjs';
import type { CanvasObject } from '@/types/canvas';

export interface YjsRoomDoc {
  doc: Y.Doc;
  objectsMap: Y.Map<CanvasObject>;
  zIndexArray: Y.Array<string>;
  snapshotsArray: Y.Array<any>;
  roomMetaMap: Y.Map<any>;
}

/**
 * Create or initialize a Y.Doc instance for a given room.
 *
 * @param roomId - Unique identifier for the canvas room
 * @returns YjsRoomDoc structure with typed shared collections
 */
export function createYjsRoomDoc(roomId: string): YjsRoomDoc {
  const doc = new Y.Doc({ guid: roomId });

  const objectsMap = doc.getMap<CanvasObject>('objects');
  const zIndexArray = doc.getArray<string>('zIndexOrder');
  const snapshotsArray = doc.getArray<any>('snapshots');
  const roomMetaMap = doc.getMap<any>('roomMeta');

  return {
    doc,
    objectsMap,
    zIndexArray,
    snapshotsArray,
    roomMetaMap,
  };
}
