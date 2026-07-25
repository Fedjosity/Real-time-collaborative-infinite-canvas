/**
 * =============================================================================
 * Yjs Awareness & Presence Helpers
 * =============================================================================
 *
 * Manages user presence and live cursor tracking over Yjs Awareness protocol.
 * Awareness State Payload:
 * {
 *   user: { username, color, deviceId },
 *   cursor: { x, y },
 *   viewport: { minX, minY, maxX, maxY },
 *   lastActive: number
 * }
 *
 * @module lib/yjs/awareness
 */

import type { Awareness } from 'y-protocols/awareness';
import type { LocalUser, User } from '@/types/room';
import type { Position } from '@/types/canvas';

export interface UserAwarenessState {
  user: LocalUser;
  cursor?: Position | null;
  lastActive?: number;
}

/**
 * Set local user identity on the Awareness instance.
 */
export function setLocalAwarenessUser(awareness: Awareness, user: LocalUser): void {
  awareness.setLocalStateField('user', user);
  awareness.setLocalStateField('lastActive', Date.now());
}

/**
 * Update local cursor position on Awareness instance.
 */
export function updateLocalAwarenessCursor(
  awareness: Awareness,
  cursor: Position | null
): void {
  awareness.setLocalStateField('cursor', cursor);
  awareness.setLocalStateField('lastActive', Date.now());
}

/**
 * Extract active connected users and live cursors from Awareness states map.
 */
export function getActiveRemoteUsers(
  awareness: Awareness,
  localClientID: number
): User[] {
  const states = awareness.getStates();
  const users: User[] = [];

  states.forEach((state, clientID) => {
    if (!state || !state.user) return;
    const isLocal = clientID === localClientID;

    users.push({
      clientId: clientID,
      id: state.user.deviceId || clientID.toString(),
      username: state.user.username || 'Anonymous',
      color: state.user.color || '#D4AF37',
      cursor: state.cursor || null,
      viewportCenter: state.viewportCenter || null,
      isActive: true,
      isOnline: true,
      lastActive: state.lastActive || Date.now(),
      isLocal,
    });
  });

  return users;
}
