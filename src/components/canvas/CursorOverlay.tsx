'use client';

import React from 'react';
import type { User } from '@/types/room';
import type { Camera } from '@/types/canvas';
import { worldToScreen } from '@/lib/canvas/viewport';

export interface CursorOverlayProps {
  users: User[];
  camera: Camera;
}

export const CursorOverlay: React.FC<CursorOverlayProps> = ({ users, camera }) => {
  // Filter for remote users with active cursor coordinates
  const remoteCursors = users.filter((u) => !u.isLocal && u.cursor);

  if (remoteCursors.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {remoteCursors.map((user) => {
        if (!user.cursor) return null;
        const screenPos = worldToScreen(user.cursor, camera);

        return (
          <div
            key={user.id}
            className="absolute top-0 left-0 transition-transform duration-75 ease-out pointer-events-none flex items-center gap-1"
            style={{
              transform: `translate3d(${screenPos.x}px, ${screenPos.y}px, 0)`,
            }}
          >
            {/* Custom Cursor Pointer SVG */}
            <svg
              className="w-5 h-5 drop-shadow-md"
              viewBox="0 0 24 24"
              fill={user.color || '#D4AF37'}
              stroke="#070709"
              strokeWidth="1.5"
            >
              <path d="M3 3l7 18 3-7 7-3L3 3z" />
            </svg>

            {/* Username Badge */}
            <span
              className="px-2 py-0.5 rounded-full text-[11px] font-semibold text-slate-950 shadow-lg whitespace-nowrap"
              style={{ backgroundColor: user.color || '#D4AF37' }}
            >
              {user.username}
            </span>
          </div>
        );
      })}
    </div>
  );
};
