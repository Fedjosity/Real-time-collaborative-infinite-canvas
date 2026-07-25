'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { generateRoomId } from '@/lib/utils/id';

export default function LandingPage() {
  const router = useRouter();
  const [joinInput, setJoinInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [joinError, setJoinError] = useState('');

  function navigateToRoom(id: string) {
    const cleanId = id.trim().replace(/.*\/room\//, '').replace(/[^a-zA-Z0-9_-]/g, '');
    if (!cleanId) {
      setJoinError('Please enter a valid Room ID or link');
      return;
    }
    router.push(`/room/${cleanId}`);
  }

  const handleCreateRoom = async () => {
    setIsCreating(true);
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Creative Studio Canvas' }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/room/${data.room.id}`);
      } else {
        const fallbackId = generateRoomId();
        router.push(`/room/${fallbackId}`);
      }
    } catch {
      const fallbackId = generateRoomId();
      router.push(`/room/${fallbackId}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateToRoom(joinInput);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#070709] text-slate-100 flex flex-col items-center justify-between bg-grid-pattern">
      {/* Gold Glow Background Effects */}
      <div className="absolute top-[-10%] left-[25%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none animate-glow" />
      <div className="absolute bottom-[-10%] right-[20%] w-[450px] h-[450px] bg-yellow-600/10 rounded-full blur-[140px] pointer-events-none animate-glow" />

      {/* Navigation Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-300/40">
            <svg className="w-6 h-6 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          </div>
          <span className="font-bold text-xl tracking-tight text-white font-display">
            Collab<span className="gradient-text">Canvas</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-400 mr-2 animate-ping" />
            Real-Time Engine Ready
          </span>
        </div>
      </header>

      {/* Center Hero Section */}
      <main className="relative z-10 w-full max-w-4xl mx-auto px-6 py-8 flex flex-col items-center text-center my-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-6">
          ✨ LUXURY COLLABORATIVE WORKSPACE
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold font-display tracking-tight leading-[1.1] mb-6">
          Infinite Canvas with <br />
          <span className="gradient-text-vibrant">Physics & Real-Time Sync</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-light leading-relaxed mb-10 mx-auto">
          An interactive 2D spatial workspace built for creative teams. Throw objects with{' '}
          <strong className="text-amber-400 font-normal">Matter.js physics</strong>, record live audio notes, replay history with{' '}
          <strong className="text-amber-300 font-normal">Time Travel</strong>, and work offline seamlessly.
        </p>

        {/* Action Form Card */}
        <div className="w-full max-w-md mx-auto glass-panel p-6 sm:p-8 mb-12 border border-amber-500/30 flex flex-col items-center">
          <div className="flex flex-col gap-5 w-full">
            {/* Create Room Button */}
            <Button
              variant="primary"
              size="lg"
              className="w-full text-base font-bold h-12 shadow-lg shadow-amber-500/20"
              isLoading={isCreating}
              onClick={handleCreateRoom}
              icon={
                <svg className="w-5 h-5 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              Create New Canvas Room
            </Button>

            {/* Divider */}
            <div className="relative flex items-center justify-center w-full my-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-amber-500/20" />
              </div>
              <span className="relative px-3 text-[11px] uppercase font-semibold text-amber-200/80 bg-[#0e0e12] rounded-full border border-amber-500/30">
                OR JOIN EXISTING
              </span>
            </div>

            {/* Join Form */}
            <form onSubmit={handleJoinSubmit} className="flex flex-col sm:flex-row gap-2.5 w-full items-center">
              <div className="flex-1 w-full">
                <Input
                  placeholder="Paste Room Link or Room ID..."
                  value={joinInput}
                  onChange={(e) => {
                    setJoinInput(e.target.value);
                    if (joinError) setJoinError('');
                  }}
                  error={joinError}
                  icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  }
                />
              </div>
              <Button type="submit" variant="secondary" size="md" className="h-11 px-5 whitespace-nowrap w-full sm:w-auto">
                Join Room
              </Button>
            </form>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-5xl mx-auto text-left">
          <div className="glass-panel p-6 border border-amber-500/20 hover:border-amber-400/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-amber-200 mb-2">Matter.js Physics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Throw shapes and cards across the canvas. Objects collide, attract, and repel in real-time.
            </p>
          </div>

          <div className="glass-panel p-6 border border-amber-500/20 hover:border-amber-400/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-amber-200 mb-2">Time-Travel Replay</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Replay entire brainstorming sessions frame-by-frame with timeline scrubbers and speed control.
            </p>
          </div>

          <div className="glass-panel p-6 border border-amber-500/20 hover:border-amber-400/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2v1a2 2 0 002 2h1.5a2.5 2.5 0 002.5-2.5V11a2 2 0 00-2-2h-1a2 2 0 01-2-2V4.07M15 2a9 9 0 100 18 9 9 0 000-18z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-amber-200 mb-2">Offline Sync & Radar</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Keep working when disconnected with IndexedDB persistence. Track peer viewports on the Mini-Map Radar.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-amber-500/15 py-4 text-center text-[11px] text-amber-200/50">
        CollabCanvas &copy; {new Date().getFullYear()} — Built for High Score Performance
      </footer>
    </div>
  );
}
