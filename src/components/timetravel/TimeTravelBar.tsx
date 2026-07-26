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
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 glass-panel px-6 py-3 bg-[#ffffff]/95 border border-outline-variant/30 text-on-primary-container text-xs font-mono">
        No historical snapshots recorded yet. Edit objects to build replay timeline.
      </div>
    );
  }

  const currentSnapshot = snapshots[currentIndex] || snapshots[snapshots.length - 1];

  return (
    <div className="fixed bottom-32 md:bottom-10 lg:bottom-12 left-1/2 -translate-x-1/2 z-[60] w-[95%] max-w-2xl p-4 md:p-5 bg-white/95 backdrop-blur-xl border border-primary/20 shadow-2xl rounded-3xl flex flex-col gap-3">
      {/* Top Controls Header */}
      <div className="flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
          <span className="font-bold text-primary tracking-wide uppercase">
            TIME-TRAVEL REPLAY
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500 font-medium">
            Step {currentIndex + 1} of {snapshots.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">
            {currentSnapshot ? formatSnapshotTime(currentSnapshot.timestamp) : ''}
          </span>
          {currentSnapshot?.author && (
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold">
              By {currentSnapshot.author}
            </span>
          )}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors ml-2"
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
          className="w-full h-2 bg-primary/20 rounded-lg appearance-none cursor-pointer accent-primary"
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
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          {([1, 2, 5] as const).map((speed) => (
            <button
              key={speed}
              onClick={() => setPlaybackSpeed(speed)}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                playbackSpeed === speed
                  ? 'bg-primary text-white font-bold shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
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
