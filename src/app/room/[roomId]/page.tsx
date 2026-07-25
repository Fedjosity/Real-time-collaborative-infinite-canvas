'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { CanvasStage } from '@/components/canvas/CanvasStage';
import { CursorOverlay } from '@/components/canvas/CursorOverlay';
import { MiniMap } from '@/components/minimap/MiniMap';
import { PeerRadar } from '@/components/minimap/PeerRadar';
import { Toolbar } from '@/components/toolbar/Toolbar';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { TimeTravelBar } from '@/components/timetravel/TimeTravelBar';
import { JoinModal } from '@/components/auth/JoinModal';
import { Button } from '@/components/ui/Button';
import { useYjs } from '@/hooks/useYjs';
import { useAwareness } from '@/hooks/useAwareness';
import { usePhysics } from '@/hooks/usePhysics';
import { useCanvasStore } from '@/store/canvasStore';
import { useRoomStore } from '@/store/roomStore';
import { useUIStore } from '@/store/uiStore';
import { STORAGE_KEYS, type LocalUser } from '@/types/room';
import { screenToWorld } from '@/lib/canvas/viewport';
import { createSnapshot, type CanvasSnapshot } from '@/lib/timetravel/snapshots';

export interface RoomPageProps {
  params: Promise<{ roomId: string }>;
}

export default function RoomPage({ params }: RoomPageProps) {
  const { roomId } = use(params);
  const router = useRouter();

  const [localUser, setLocalUser] = useState<LocalUser | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Time-Travel Replay State
  const [isReplaying, setIsReplaying] = useState(false);
  const [snapshots, setSnapshots] = useState<CanvasSnapshot[]>([]);
  const [snapshotIndex, setSnapshotIndex] = useState(0);

  const camera = useCanvasStore((state) => state.camera);
  const selectedObjectIds = useCanvasStore((state) => state.selectedObjectIds);
  const selectObject = useCanvasStore((state) => state.selectObject);

  const connectionStatus = useRoomStore((state) => state.connectionStatus);
  const connectedUsers = useRoomStore((state) => state.connectedUsers);
  const addToast = useUIStore((state) => state.addToast);

  // Load identity from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.LOCAL_USER);
    if (stored) {
      try {
        setLocalUser(JSON.parse(stored));
      } catch (err) {
        setShowJoinModal(true);
      }
    } else {
      setShowJoinModal(true);
    }
  }, []);

  // Yjs Real-Time CRDT Sync hook
  const {
    objects,
    awareness,
    addObject,
    updateObject,
  } = useYjs(roomId, localUser);

  // Record snapshots whenever objects change
  useEffect(() => {
    if (objects.length === 0) return;
    setSnapshots((prev) => {
      const snap = createSnapshot(objects, localUser?.username || 'Guest');
      return [...prev.slice(-30), snap]; // Keep last 30 snapshots
    });
  }, [objects, localUser]);

  // Live Awareness cursor tracking hook
  const { remoteUsers, updateCursor } = useAwareness(awareness, localUser);

  // Matter.js 2D Physics Engine hook
  usePhysics({
    objects,
    onUpdateObject: (id, attrs) => updateObject(id, attrs),
  });

  // Handle stage pointer movement to broadcast cursor coordinates
  const handleMouseMove = (e: React.MouseEvent) => {
    const worldPos = screenToWorld({ x: e.clientX, y: e.clientY }, camera);
    updateCursor(worldPos);
  };

  // Copy shareable room invite URL
  const copyInviteLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    addToast({ type: 'success', message: 'Room link copied to clipboard!' });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Handle adding objects from Toolbar
  const handleAddObjectFromToolbar = (type: string, extraData?: Record<string, unknown>) => {
    const centerScreen = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const worldCenter = screenToWorld(centerScreen, camera);
    addObject(type, worldCenter, extraData);
  };

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-[#070709] text-slate-100 flex flex-col select-none"
      onMouseMove={handleMouseMove}
    >
      {/* Top Header Navigation Bar */}
      <header className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between glass-panel p-3 px-5 border border-amber-500/20 bg-[#0e0e12]/90 shadow-2xl rounded-2xl pointer-events-auto">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-slate-300 hover:text-amber-300 transition-colors font-display font-bold text-lg cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-400 to-yellow-600 flex items-center justify-center text-slate-950 font-extrabold text-sm shadow-md">
              C
            </div>
            <span>Collab<span className="gradient-text">Canvas</span></span>
          </button>

          <span className="text-slate-700">|</span>

          {/* Room Title & ID Badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-amber-300/80 bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-500/20">
              Room: {roomId}
            </span>
          </div>
        </div>

        {/* Status Indicators & Share Actions */}
        <div className="flex items-center gap-3">
          {/* Connection Status Pill */}
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                connectionStatus === 'connected'
                  ? 'bg-emerald-400 animate-pulse'
                  : connectionStatus === 'syncing'
                  ? 'bg-amber-400 animate-ping'
                  : 'bg-rose-500'
              }`}
            />
            <span className="capitalize text-slate-300">
              {connectionStatus === 'connected' ? 'Connected' : connectionStatus}
            </span>
          </div>

          {/* User Count Badge */}
          <div className="flex items-center gap-1.5 text-xs text-amber-200 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20 font-medium">
            <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>{connectedUsers.length || 1} / 20</span>
          </div>

          {/* Time-Travel Replay Toggle Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsReplaying(!isReplaying);
              setSnapshotIndex(Math.max(0, snapshots.length - 1));
            }}
            icon={
              <svg className="w-4 h-4 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          >
            {isReplaying ? 'Exit Replay' : 'Time Travel'}
          </Button>

          {/* Share Room Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={copyInviteLink}
            icon={
              <svg className="w-4 h-4 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            }
          >
            {copiedLink ? 'Copied!' : 'Share Room'}
          </Button>
        </div>
      </header>

      {/* Main Canvas Component */}
      <div className="flex-1 w-full h-full relative">
        <CanvasStage
          objects={isReplaying && snapshots[snapshotIndex] ? snapshots[snapshotIndex].objects : objects}
          selectedObjectIds={selectedObjectIds}
          onSelectObject={(id, multi) => selectObject(id, multi)}
          onUpdateObject={(id, attrs) => updateObject(id, attrs)}
        />

        {/* Live User Presence Cursors Overlay */}
        <CursorOverlay users={remoteUsers} camera={camera} />

        {/* Off-Screen Peer Spatial Radar */}
        <PeerRadar users={remoteUsers} camera={camera} />

        {/* Offline Notification Banner */}
        <OfflineBanner />

        {/* Time-Travel Session Replay Timeline Scrubber Bar */}
        {isReplaying && (
          <TimeTravelBar
            snapshots={snapshots}
            currentIndex={snapshotIndex}
            onSelectSnapshot={(index) => setSnapshotIndex(index)}
            onClose={() => setIsReplaying(false)}
          />
        )}

        {/* Floating Creative Toolbar */}
        <Toolbar onAddObject={handleAddObjectFromToolbar} />

        {/* Bottom-Right Mini-Map Widget */}
        <div className="absolute bottom-6 right-6 z-40">
          <MiniMap objects={objects} users={remoteUsers} />
        </div>
      </div>

      {/* Guest Authentication Join Modal */}
      <JoinModal
        isOpen={showJoinModal}
        roomId={roomId}
        onJoin={(user) => {
          setLocalUser(user);
          setShowJoinModal(false);
          addToast({ type: 'success', message: `Welcome to room ${roomId}, ${user.username}!` });
        }}
      />
    </div>
  );
}
