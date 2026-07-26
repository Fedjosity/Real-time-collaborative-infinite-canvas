/**
 * =============================================================================
 * Yjs Real-Time CRDT State Sync Hook
 * =============================================================================
 *
 * Primary CRDT hook that connects the Y.Doc shared collections to React state:
 * - Initializes Y.Doc + WebsocketProvider + IndexedDB persistence on mount
 * - Listens to Y.Map ('objects') changes and updates local object state
 * - Provides conflict-free CRUD mutation handlers:
 *   - `addObject(type, position, data)`
 *   - `updateObject(id, partialAttrs)`
 *   - `deleteObject(id)`
 *
 * @module hooks/useYjs
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import * as Y from 'yjs';
import type { WebsocketProvider } from 'y-websocket';
import type { CanvasObject } from '@/types/canvas';
import type { LocalUser } from '@/types/room';
import { createYjsRoomDoc } from '@/lib/yjs/doc';
import { createYjsProviders } from '@/lib/yjs/provider';
import { useRoomStore } from '@/store/roomStore';
import { useCanvasStore } from '@/store/canvasStore';
import { generateObjectId } from '@/lib/utils/id';
import {
  DEFAULT_TEXT_DATA,
  DEFAULT_SHAPE_DATA,
  DEFAULT_STICKY_DATA,
  DEFAULT_PHYSICS,
} from '@/types/canvas';

export function useYjs(roomId: string, localUser: LocalUser | null) {
  const [objects, setObjects] = useState<CanvasObject[]>([]);
  const [assets, setAssets] = useState<string[]>([]);
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [isSynced, setIsSynced] = useState(false);

  const docRef = useRef<Y.Doc | null>(null);
  const objectsMapRef = useRef<Y.Map<CanvasObject> | null>(null);
  const zIndexArrayRef = useRef<Y.Array<string> | null>(null);
  const assetsArrayRef = useRef<Y.Array<string> | null>(null);
  const undoManagerRef = useRef<Y.UndoManager | null>(null);

  const setConnectionStatus = useRoomStore((state) => state.setConnectionStatus);
  const physicsEnabled = useCanvasStore((state) => state.physicsEnabled);
  const setPhysicsEnabled = useCanvasStore((state) => state.setPhysicsEnabled);

  // Initialize Y.Doc & Providers
  useEffect(() => {
    if (!roomId) return;

    const { doc, objectsMap, zIndexArray, roomMetaMap, assetsArray } = createYjsRoomDoc(roomId);
    docRef.current = doc;
    objectsMapRef.current = objectsMap;
    zIndexArrayRef.current = zIndexArray;
    assetsArrayRef.current = assetsArray;
    undoManagerRef.current = new Y.UndoManager(objectsMap);

    const { wsProvider, destroy } = createYjsProviders({
      roomId,
      doc,
      onStatusChange: (status) => setConnectionStatus(status),
      onSynced: () => setIsSynced(true),
    });

    setProvider(wsProvider);

    // Sync objects Y.Map to local React state
    const handleObjectsChange = () => {
      const allObjects = Array.from(objectsMap.values());
      setObjects(allObjects);
    };

    handleObjectsChange();
    objectsMap.observe(handleObjectsChange);

    // Sync roomMeta physics state
    const handleMetaChange = () => {
      const metaPhysics = roomMetaMap.get('physicsEnabled');
      if (typeof metaPhysics === 'boolean') {
        setPhysicsEnabled(metaPhysics);
      }
    };

    roomMetaMap.observe(handleMetaChange);

    // Sync assets
    const handleAssetsChange = () => {
      setAssets(assetsArray.toArray());
    };
    handleAssetsChange();
    assetsArray.observe(handleAssetsChange);

    return () => {
      objectsMap.unobserve(handleObjectsChange);
      roomMetaMap.unobserve(handleMetaChange);
      assetsArray.unobserve(handleAssetsChange);
      undoManagerRef.current?.destroy();
      destroy();
    };
  }, [roomId, setConnectionStatus, setPhysicsEnabled]);

  // Sync physics state changes back to Yjs roomMeta
  const setRoomPhysicsMeta = useCallback((enabled: boolean) => {
    if (!docRef.current) return;
    const roomMetaMap = docRef.current.getMap<any>('roomMeta');
    roomMetaMap.set('physicsEnabled', enabled);
  }, []);

  /**
   * Add a new object to the shared Y.Map.
   */
  const addObject = useCallback(
    (type: string, position: { x: number; y: number }, extraData: Record<string, unknown> = {}) => {
      const map = objectsMapRef.current;
      const zArray = zIndexArrayRef.current;
      if (!map || !zArray) return;

      const id = generateObjectId();
      let objectData: any = {};
      let width = 200;
      let height = 150;

      switch (type) {
        case 'text':
          objectData = { ...DEFAULT_TEXT_DATA, ...extraData };
          width = 220;
          height = 60;
          break;
        case 'shape':
          objectData = { ...DEFAULT_SHAPE_DATA, ...extraData };
          width = 160;
          height = 160;
          break;
        case 'sticky':
          objectData = {
            ...DEFAULT_STICKY_DATA,
            author: localUser?.username || 'Guest',
            ...extraData,
          };
          width = 200;
          height = 180;
          break;
        case 'image':
          objectData = { src: extraData.src || '', alt: extraData.alt || '' };
          width = 300;
          height = 220;
          break;
        case 'audio':
          objectData = {
            audioId: extraData.audioId || '',
            duration: extraData.duration || 0,
            waveform: extraData.waveform || [],
          };
          width = 240;
          height = 70;
          break;
        default:
          objectData = extraData;
      }

      const newObject: CanvasObject = {
        id,
        type: type as any,
        x: position.x,
        y: position.y,
        width,
        height,
        rotation: 0,
        data: objectData,
        physics: { ...DEFAULT_PHYSICS, enabled: physicsEnabled },
        createdBy: localUser?.username || 'Guest',
        createdAt: Date.now(),
        zIndex: map.size + 1,
        locked: false,
        opacity: 1,
      };

      docRef.current?.transact(() => {
        map.set(id, newObject);
        zArray.push([id]);
      });

      return newObject;
    },
    [localUser, physicsEnabled]
  );

  /**
   * Update properties of an existing object in Y.Map.
   */
  const updateObject = useCallback((id: string, partialAttrs: Partial<CanvasObject>) => {
    const map = objectsMapRef.current;
    if (!map) return;

    const existing = map.get(id);
    if (!existing) return;

    const updated: CanvasObject = {
      ...existing,
      ...partialAttrs,
      // Merge data payload if present
      data: partialAttrs.data ? { ...existing.data, ...partialAttrs.data } : existing.data,
    };

    map.set(id, updated);
  }, []);

  /**
   * Delete an object from the Y.Map.
   */
  const deleteObject = useCallback((id: string) => {
    const map = objectsMapRef.current;
    if (!map) return;
    map.delete(id);
  }, []);

  const undo = useCallback(() => {
    undoManagerRef.current?.undo();
  }, []);

  const redo = useCallback(() => {
    undoManagerRef.current?.redo();
  }, []);

  const addAsset = useCallback((assetUrl: string) => {
    assetsArrayRef.current?.push([assetUrl]);
  }, []);

  return {
    doc: docRef.current,
    objects,
    assets,
    provider,
    awareness: provider?.awareness || null,
    isSynced,
    addObject,
    updateObject,
    deleteObject,
    setRoomPhysicsMeta,
    undo,
    redo,
    addAsset,
  };
}
