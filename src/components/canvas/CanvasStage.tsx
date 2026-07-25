'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import type { InfiniteCanvasProps } from './InfiniteCanvas';

/**
 * Dynamically import InfiniteCanvas with SSR disabled.
 * Prevents Konva from attempting to load server-side 'canvas' module in Next.js SSR.
 */
const InfiniteCanvasClient = dynamic<InfiniteCanvasProps>(
  () => import('./InfiniteCanvas').then((mod) => mod.InfiniteCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-[#070709] text-amber-300 font-mono text-sm">
        <div className="flex items-center gap-3 glass-panel px-6 py-4 border border-amber-500/30">
          <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
          <span>Initializing 2D Canvas Engine...</span>
        </div>
      </div>
    ),
  }
);

export const CanvasStage: React.FC<InfiniteCanvasProps> = (props) => {
  return <InfiniteCanvasClient {...props} />;
};
