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
      <div className="w-full h-full flex items-center justify-center bg-[#f8f9fa] text-[#0061a5] font-sans text-sm">
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-xl px-6 py-4 rounded-2xl border border-[#bfc7d5] shadow-lg">
          <span className="w-3 h-3 rounded-full bg-[#0d99ff] animate-ping" />
          <span className="font-medium">Initializing Canvas Engine...</span>
        </div>
      </div>
    ),
  }
);

export const CanvasStage: React.FC<InfiniteCanvasProps> = (props) => {
  return <InfiniteCanvasClient {...props} />;
};
