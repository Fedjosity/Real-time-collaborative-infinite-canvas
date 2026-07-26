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
  const latestStatesByDevice = new Map<string, { clientID: number; state: any; isLocal: boolean }>();

  // 1. Group by deviceId and keep the most recently active state
  states.forEach((state, clientID) => {
    if (!state || !state.user) return;
    
    const id = state.user.deviceId || clientID.toString();
    const isLocal = clientID === localClientID;
    
    // Always prefer the actual local client for our own deviceId
    if (isLocal) {
      latestStatesByDevice.set(id, { clientID, state, isLocal });
    } else {
      const existing = latestStatesByDevice.get(id);
      // If we already have our local client mapped for this deviceId, do not overwrite it with a remote tab's state
      if (existing && existing.isLocal) return;

      // Otherwise, keep the one with the most recent lastActive timestamp
      if (!existing || (state.lastActive || 0) > (existing.state.lastActive || 0)) {
        latestStatesByDevice.set(id, { clientID, state, isLocal });
      }
    }
  });

  // 2. Map to User[]
  const users: User[] = [];
  latestStatesByDevice.forEach(({ clientID, state, isLocal }, id) => {
    users.push({
      clientId: clientID,
      id,
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
