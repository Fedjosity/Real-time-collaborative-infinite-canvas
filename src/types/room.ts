/**
 * =============================================================================
 * Room & User Type Definitions
 * =============================================================================
 *
 * Types for room management, user sessions, and connection state.
 * Used by the room store, auth system, and presence tracking.
 *
 * @module types/room
 */

// ─── Connection Status ──────────────────────────────────────────────────────

/**
 * WebSocket connection states.
 * Displayed as a colored indicator in the toolbar:
 *   🟢 connected  |  🟡 connecting/syncing  |  🔴 disconnected
 */
export type ConnectionStatus =
  | 'connecting'    // Initial WebSocket handshake in progress
  | 'connected'     // WebSocket open, Yjs doc synced
  | 'syncing'       // Reconnected, syncing offline changes
  | 'disconnected'; // WebSocket closed (offline or error)

// ─── User Types ─────────────────────────────────────────────────────────────

/**
 * A user in the current room.
 * Presence data comes from Yjs Awareness protocol.
 */
export interface User {
  /** Yjs client ID (unique per browser tab) */
  clientId: number;
  /** Unique user device or session ID string */
  id?: string;
  /** Display name chosen during join */
  username: string;
  /** Assigned hex color for cursor and avatar */
  color: string;
  /** Current cursor position in world coordinates (null if not on canvas) */
  cursor: { x: number; y: number } | null;
  /** Center of the user's current viewport in world coordinates */
  viewportCenter: { x: number; y: number } | null;
  /** Whether this user is currently active (has interacted recently) */
  isActive: boolean;
  /** Last activity timestamp (for idle detection) */
  lastActive: number;
  /** Whether this presence represents the local user */
  isLocal?: boolean;
  /** Network connection status */
  isOnline?: boolean;
}

/**
 * Local user identity, persisted in localStorage.
 * Created during the join flow and reused across sessions.
 */
export interface LocalUser {
  /** Display name */
  username: string;
  /** Assigned hex color */
  color: string;
  /** Unique device ID (persisted across rooms) */
  deviceId: string;
}

// ─── Room Types ─────────────────────────────────────────────────────────────

/**
 * Room metadata and state.
 */
export interface Room {
  /** Room ID (used in the URL: /room/:id) */
  id: string;
  /** Optional room name */
  name: string | null;
  /** Maximum concurrent users */
  maxUsers: number;
  /** When the room was created */
  createdAt: string;
}

/**
 * Room state managed by the room Zustand store.
 * Combines room metadata, user presence, and connection state.
 */
export interface RoomState {
  /** Current room info (null if not in a room) */
  room: Room | null;
  /** Local user identity */
  localUser: LocalUser | null;
  /** All users in the room (from Yjs Awareness) */
  connectedUsers: User[];
  /** WebSocket connection status */
  connectionStatus: ConnectionStatus;
  /** Whether the browser is online */
  isOnline: boolean;
}

// ─── Room API Types ─────────────────────────────────────────────────────────

/** Request body for creating a new room */
export interface CreateRoomRequest {
  name?: string;
}

/** Response from room creation API */
export interface CreateRoomResponse {
  room: Room;
  /** Shareable URL for inviting others */
  inviteUrl: string;
}

/** Response from room join validation */
export interface JoinRoomResponse {
  room: Room;
  /** Current number of connected users */
  currentUsers: number;
  /** Whether the room is full */
  isFull: boolean;
}

// ─── Local Storage Keys ─────────────────────────────────────────────────────

/** Keys used for localStorage persistence */
export const STORAGE_KEYS = {
  /** Local user identity (username, color, deviceId) */
  LOCAL_USER: 'collabcanvas:user',
  /** Last visited room ID (for quick rejoin) */
  LAST_ROOM: 'collabcanvas:lastRoom',
  /** UI preferences (panel visibility, etc.) */
  UI_PREFS: 'collabcanvas:uiPrefs',
} as const;
