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

  // Handle direct navigation to room
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
        // Fallback to client-generated ID
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
    <div className="relative min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between overflow-hidden bg-grid-pattern">
      {/* Glow Effects */}
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none animate-glow" />
      <div className="absolute bottom-[-10%] right-[15%] w-[450px] h-[450px] bg-pink-600/15 rounded-full blur-[120px] pointer-events-none animate-glow" />

      {/* Navigation Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          </div>
          <span className="font-bold text-xl tracking-tight text-white font-display">
            Collab<span className="gradient-text">Canvas</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-ping" />
            Real-Time Engine Ready
          </span>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 w-full max-w-6xl mx-auto px-6 py-12 flex flex-col items-center text-center my-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-8 shadow-inner">
          ✨ Next-Gen Collaborative Canvas
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold font-display tracking-tight leading-[1.1] mb-6 max-w-4xl">
          Infinite Canvas with <br />
          <span className="gradient-text-vibrant">Physics & Real-Time Sync</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl font-light leading-relaxed mb-12">
          An interactive 2D spatial workspace built for creative teams. Throw objects with 
          <strong className="text-indigo-400 font-normal"> Matter.js physics</strong>, record live audio notes, replay history with <strong className="text-pink-400 font-normal">Time Travel</strong>, and work offline seamlessly.
        </p>

        {/* Call-to-Action Card */}
        <div className="w-full max-w-xl glass-panel p-8 mb-16 shadow-2xl border border-slate-800">
          <div className="flex flex-col gap-6">
            {/* Create Room */}
            <div>
              <Button
                variant="primary"
                size="lg"
                className="w-full text-base font-semibold py-4"
                isLoading={isCreating}
                onClick={handleCreateRoom}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                Create New Canvas Room
              </Button>
            </div>

            <div className="relative flex items-center justify-center my-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <span className="relative px-4 text-xs uppercase font-semibold text-slate-500 bg-slate-900 rounded-full">
                or join existing
              </span>
            </div>

            {/* Join Room */}
            <form onSubmit={handleJoinSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
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
              <Button type="submit" variant="secondary" size="md" className="whitespace-nowrap">
                Join Room
              </Button>
            </form>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="glass-panel p-6 border border-slate-800/80 hover:border-indigo-500/40 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Matter.js Physics</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Throw shapes and cards across the canvas. Objects collide, attract, and repel in real-time.
            </p>
          </div>

          <div className="glass-panel p-6 border border-slate-800/80 hover:border-pink-500/40 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center mb-4">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Time-Travel Replay</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Replay entire brainstorming sessions frame-by-frame with timeline scrubbers and speed control.
            </p>
          </div>

          <div className="glass-panel p-6 border border-slate-800/80 hover:border-emerald-500/40 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2v1a2 2 0 002 2h1.5a2.5 2.5 0 002.5-2.5V11a2 2 0 00-2-2h-1a2 2 0 01-2-2V4.07M15 2a9 9 0 100 18 9 9 0 000-18z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Offline Sync & Radar</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Keep working when disconnected with IndexedDB persistence. Track peer viewports on the Mini-Map Radar.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        CollabCanvas &copy; {new Date().getFullYear()} — Built for High Score Performance
      </footer>
    </div>
  );
}
