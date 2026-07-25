'use client';

import React, { useState, useEffect } from 'react';
import type { User } from '@/types/room';
import type { Camera } from '@/types/canvas';
import { worldToScreen } from '@/lib/canvas/viewport';

export interface PeerRadarProps {
  users: User[];
  camera: Camera;
}

export const PeerRadar: React.FC<PeerRadarProps> = ({ users, camera }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const padding = 40;

  // Filter for off-screen remote peers with known positions
  const offscreenPeers = users.filter((user) => {
    if (user.isLocal || !user.cursor) return false;
    const screenPos = worldToScreen(user.cursor, camera);
    return (
      screenPos.x < 0 ||
      screenPos.x > screenWidth ||
      screenPos.y < 0 ||
      screenPos.y > screenHeight
    );
  });

  if (offscreenPeers.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {offscreenPeers.map((user) => {
        if (!user.cursor) return null;
        const screenPos = worldToScreen(user.cursor, camera);

        // Clamp screen coordinates to viewport boundaries
        const clampedX = Math.max(padding, Math.min(screenWidth - padding, screenPos.x));
        const clampedY = Math.max(padding, Math.min(screenHeight - padding, screenPos.y));

        // Calculate angle towards peer
        const dx = screenPos.x - screenWidth / 2;
        const dy = screenPos.y - screenHeight / 2;
        const angleRad = Math.atan2(dy, dx);
        const angleDeg = (angleRad * 180) / Math.PI;

        return (
          <div
            key={user.id || user.clientId}
            className="absolute top-0 left-0 flex items-center gap-1.5 pointer-events-none transition-transform duration-100"
            style={{
              transform: `translate3d(${clampedX}px, ${clampedY}px, 0)`,
            }}
          >
            {/* Directional Radar Arrow */}
            <div
              className="w-4 h-4 flex items-center justify-center transition-transform"
              style={{ transform: `rotate(${angleDeg}deg)` }}
            >
              <svg className="w-4 h-4 drop-shadow-md" viewBox="0 0 24 24" fill={user.color || '#0d99ff'}>
                <path d="M12 2L22 22L12 17L2 22L12 2Z" />
              </svg>
            </div>

            {/* Peer Username Badge */}
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-bold text-on-surface shadow-lg whitespace-nowrap opacity-90 border border-on-surface"
              style={{ backgroundColor: user.color || '#0d99ff' }}
            >
              {user.username}
            </span>
          </div>
        );
      })}
    </div>
  );
};
