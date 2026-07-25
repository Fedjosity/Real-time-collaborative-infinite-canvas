'use client';

import React, { useState, useEffect } from 'react';
import type { CanvasSnapshot } from '@/lib/timetravel/snapshots';
import { formatSnapshotTime } from '@/lib/timetravel/snapshots';
import { Button } from '@/components/ui/Button';

export interface TimeTravelBarProps {
  snapshots: CanvasSnapshot[];
  currentIndex: number;
  onSelectSnapshot: (index: number) => void;
  onClose: () => void;
}

export const TimeTravelBar: React.FC<TimeTravelBarProps> = ({
  snapshots,
  currentIndex,
  onSelectSnapshot,
  onClose,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2 | 5>(1);

  // Playback timer interval
  useEffect(() => {
    if (!isPlaying || snapshots.length === 0) return;

    const intervalMs = 1000 / playbackSpeed;
    const timer = setInterval(() => {
      onSelectSnapshot(
        currentIndex >= snapshots.length - 1 ? 0 : currentIndex + 1
      );
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, currentIndex, snapshots.length, playbackSpeed, onSelectSnapshot]);

  if (snapshots.length === 0) {
    return (
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 glass-panel px-6 py-3 bg-[#0e0e12]/95 border border-amber-500/30 text-amber-300 text-xs font-mono">
        No historical snapshots recorded yet. Edit objects to build replay timeline.
      </div>
    );
  }

  const currentSnapshot = snapshots[currentIndex] || snapshots[snapshots.length - 1];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl glass-panel p-4 bg-[#0e0e12]/95 border border-amber-500/30 shadow-2xl rounded-2xl flex flex-col gap-3">
      {/* Top Controls Header */}
      <div className="flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse" />
          <span className="font-bold text-amber-300 tracking-wide uppercase">
            TIME-TRAVEL REPLAY
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300">
            Step {currentIndex + 1} of {snapshots.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">
            {currentSnapshot ? formatSnapshotTime(currentSnapshot.timestamp) : ''}
          </span>
          {currentSnapshot?.author && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px]">
              By {currentSnapshot.author}
            </span>
          )}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-amber-300 p-1 rounded-lg hover:bg-slate-800 transition-colors ml-2"
            aria-label="Close replay"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Scrubber Range Slider */}
      <div className="w-full flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={snapshots.length - 1}
          value={currentIndex}
          onChange={(e) => onSelectSnapshot(parseInt(e.target.value, 10))}
          className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-amber-400"
        />
      </div>

      {/* Playback Controls & Speed Selectors */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          {/* Step Backward */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onSelectSnapshot(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
          >
            ⏮
          </Button>

          {/* Play / Pause Toggle */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-5 font-bold"
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </Button>

          {/* Step Forward */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onSelectSnapshot(Math.min(snapshots.length - 1, currentIndex + 1))}
            disabled={currentIndex >= snapshots.length - 1}
          >
            ⏭
          </Button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-amber-500/20">
          {([1, 2, 5] as const).map((speed) => (
            <button
              key={speed}
              onClick={() => setPlaybackSpeed(speed)}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                playbackSpeed === speed
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
