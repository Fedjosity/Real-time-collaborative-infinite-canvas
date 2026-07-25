/**
 * =============================================================================
 * Room Store (Zustand)
 * =============================================================================
 *
 * Manages room metadata, user presence, and connection status:
 * - Room ID and shareable link info
 * - Local user identity (username, color, device ID)
 * - Connected remote users (from Yjs Awareness)
 * - Connection status (connecting, connected, syncing, disconnected)
 * - Browser online/offline state
 *
 * @module store/roomStore
 */

import { create } from 'zustand';
import type { ConnectionStatus, LocalUser, User, Room } from '@/types/room';

export interface RoomStoreState {
  /** Room metadata */
  room: Room | null;
  /** Room ID shorthand */
  roomId: string | null;
  /** Local user identity */
  localUser: LocalUser | null;
  /** All connected users in room */
  connectedUsers: User[];
  /** WebSocket connection state */
  connectionStatus: ConnectionStatus;
  /** Network connectivity status */
  isOnline: boolean;

  // Actions
  setRoom: (room: Room | null) => void;
  setRoomId: (id: string | null) => void;
  setLocalUser: (user: LocalUser | null) => void;
  setConnectedUsers: (users: User[]) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setIsOnline: (online: boolean) => void;
  resetRoomState: () => void;
}

export const useRoomStore = create<RoomStoreState>((set) => ({
  room: null,
  roomId: null,
  localUser: null,
  connectedUsers: [],
  connectionStatus: 'connecting',
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,

  setRoom: (room) => set({ room, roomId: room?.id || null }),

  setRoomId: (roomId) => set({ roomId }),

  setLocalUser: (localUser) => set({ localUser }),

  setConnectedUsers: (connectedUsers) => set({ connectedUsers }),

  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),

  setIsOnline: (isOnline) => set({ isOnline }),

  resetRoomState: () =>
    set({
      room: null,
      roomId: null,
      connectedUsers: [],
      connectionStatus: 'disconnected',
    }),
}));
