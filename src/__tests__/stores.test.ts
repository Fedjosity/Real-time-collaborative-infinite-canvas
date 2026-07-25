/**
 * =============================================================================
 * Zustand Store Unit Tests
 * =============================================================================
 *
 * Tests for canvasStore, roomStore, and uiStore.
 *
 * @module __tests__/stores.test
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useCanvasStore } from '@/store/canvasStore';
import { useRoomStore } from '@/store/roomStore';
import { useUIStore } from '@/store/uiStore';

describe('Zustand Stores', () => {
  beforeEach(() => {
    useCanvasStore.getState().resetCanvasState();
    useRoomStore.getState().resetRoomState();
  });

  describe('canvasStore', () => {
    it('initializes with default tool and camera', () => {
      const state = useCanvasStore.getState();
      expect(state.activeTool).toBe('select');
      expect(state.camera).toEqual({ x: 0, y: 0, scale: 1.0 });
      expect(state.physicsEnabled).toBe(false);
    });

    it('updates active tool', () => {
      useCanvasStore.getState().setActiveTool('shape');
      expect(useCanvasStore.getState().activeTool).toBe('shape');
    });

    it('manages object selection', () => {
      const store = useCanvasStore.getState();
      store.selectObject('obj-1');
      expect(useCanvasStore.getState().selectedObjectIds).toEqual(['obj-1']);

      // Multi-select append
      useCanvasStore.getState().selectObject('obj-2', true);
      expect(useCanvasStore.getState().selectedObjectIds).toEqual(['obj-1', 'obj-2']);

      // Multi-select toggle off
      useCanvasStore.getState().selectObject('obj-1', true);
      expect(useCanvasStore.getState().selectedObjectIds).toEqual(['obj-2']);

      // Clear selection
      useCanvasStore.getState().clearSelection();
      expect(useCanvasStore.getState().selectedObjectIds).toEqual([]);
    });

    it('pans camera correctly', () => {
      useCanvasStore.getState().panBy(50, -30);
      expect(useCanvasStore.getState().camera).toEqual({ x: 50, y: -30, scale: 1.0 });
    });

    it('clamps zoom levels within limits', () => {
      useCanvasStore.getState().setZoom(0.01); // Below min 0.1
      expect(useCanvasStore.getState().camera.scale).toBe(0.1);

      useCanvasStore.getState().setZoom(10.0); // Above max 5.0
      expect(useCanvasStore.getState().camera.scale).toBe(5.0);
    });

    it('toggles physics', () => {
      expect(useCanvasStore.getState().physicsEnabled).toBe(false);
      useCanvasStore.getState().togglePhysics();
      expect(useCanvasStore.getState().physicsEnabled).toBe(true);
    });
  });

  describe('roomStore', () => {
    it('sets room metadata and ID', () => {
      const mockRoom = {
        id: 'room-123',
        name: 'Test Room',
        maxUsers: 20,
        createdAt: new Date().toISOString(),
      };
      useRoomStore.getState().setRoom(mockRoom);
      expect(useRoomStore.getState().roomId).toBe('room-123');
      expect(useRoomStore.getState().room).toEqual(mockRoom);
    });

    it('updates connection status', () => {
      useRoomStore.getState().setConnectionStatus('connected');
      expect(useRoomStore.getState().connectionStatus).toBe('connected');
    });
  });

  describe('uiStore', () => {
    it('toggles panel visibility', () => {
      expect(useUIStore.getState().showMiniMap).toBe(true);
      useUIStore.getState().toggleMiniMap();
      expect(useUIStore.getState().showMiniMap).toBe(false);

      expect(useUIStore.getState().showTimeTravelPanel).toBe(false);
      useUIStore.getState().toggleTimeTravelPanel();
      expect(useUIStore.getState().showTimeTravelPanel).toBe(true);
    });

    it('adds and removes toasts', () => {
      useUIStore.getState().addToast({
        type: 'success',
        message: 'Room created!',
        duration: 0, // Prevent auto timeout in test
      });

      const toasts = useUIStore.getState().toasts;
      expect(toasts).toHaveLength(1);
      expect(toasts[0]?.message).toBe('Room created!');

      const toastId = toasts[0]!.id;
      useUIStore.getState().removeToast(toastId);
      expect(useUIStore.getState().toasts).toHaveLength(0);
    });
  });
});
