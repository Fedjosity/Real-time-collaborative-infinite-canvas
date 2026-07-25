/**
 * =============================================================================
 * Awareness React Hook
 * =============================================================================
 *
 * Tracks local cursor movement and returns active peer user states for live rendering.
 *
 * @module hooks/useAwareness
 */

import { useState, useEffect, useCallback } from 'react';
import type { Awareness } from 'y-protocols/awareness';
import type { LocalUser, User } from '@/types/room';
import type { Position } from '@/types/canvas';
import {
  setLocalAwarenessUser,
  updateLocalAwarenessCursor,
  getActiveRemoteUsers,
} from '@/lib/yjs/awareness';
import { useRoomStore } from '@/store/roomStore';

export function useAwareness(awareness: Awareness | null, localUser: LocalUser | null) {
  const [remoteUsers, setRemoteUsers] = useState<User[]>([]);
  const setConnectedUsers = useRoomStore((state) => state.setConnectedUsers);

  // Set local identity when awareness or localUser changes
  useEffect(() => {
    if (!awareness || !localUser) return;
    setLocalAwarenessUser(awareness, localUser);
  }, [awareness, localUser]);

  // Subscribe to awareness change events
  useEffect(() => {
    if (!awareness) return;

    const handleAwarenessChange = () => {
      const activeUsers = getActiveRemoteUsers(awareness, awareness.clientID);
      setRemoteUsers(activeUsers);
      setConnectedUsers(activeUsers);
    };

    handleAwarenessChange();
    awareness.on('change', handleAwarenessChange);

    return () => {
      awareness.off('change', handleAwarenessChange);
    };
  }, [awareness, setConnectedUsers]);

  // Broadcast cursor movement
  const updateCursor = useCallback(
    (cursorPos: Position | null) => {
      if (!awareness) return;
      updateLocalAwarenessCursor(awareness, cursorPos);
    },
    [awareness]
  );

  return {
    remoteUsers,
    updateCursor,
  };
}
