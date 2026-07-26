"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CanvasStage } from "@/components/canvas/CanvasStage";
import { CursorOverlay } from "@/components/canvas/CursorOverlay";
import { MiniMap } from "@/components/minimap/MiniMap";
import { PeerRadar } from "@/components/minimap/PeerRadar";
import { Toolbar } from "@/components/toolbar/Toolbar";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { KeyboardShortcutsModal } from "@/components/ui/KeyboardShortcutsModal";
import { TimeTravelBar } from "@/components/timetravel/TimeTravelBar";
import { ExportMenu } from "@/components/export/ExportMenu";
import { JoinModal } from "@/components/auth/JoinModal";
import { Modal } from "@/components/ui/Modal";
import { useYjs } from "@/hooks/useYjs";
import { useAwareness } from "@/hooks/useAwareness";
import { usePhysics } from "@/hooks/usePhysics";
import { useCanvasStore } from "@/store/canvasStore";
import { useRoomStore } from "@/store/roomStore";
import { useUIStore } from "@/store/uiStore";
import { STORAGE_KEYS, type LocalUser } from "@/types/room";
import { screenToWorld } from "@/lib/canvas/viewport";
import {
  createSnapshot,
  type CanvasSnapshot,
} from "@/lib/timetravel/snapshots";

// MUI Icons
import HistoryIcon from "@mui/icons-material/History";
import HelpIcon from "@mui/icons-material/Help";
import ShareIcon from "@mui/icons-material/Share";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

export interface RoomPageProps {
  params: Promise<{ roomId: string }>;
}

export default function RoomPage({ params }: RoomPageProps) {
  const { roomId } = use(params);
  const router = useRouter();

  const [localUser, setLocalUser] = useState<LocalUser | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Time-Travel Replay State
  const [isReplaying, setIsReplaying] = useState(false);
  const [snapshots, setSnapshots] = useState<CanvasSnapshot[]>([]);
  const [snapshotIndex, setSnapshotIndex] = useState(0);
  const [showUsersModal, setShowUsersModal] = useState(false);

  const camera = useCanvasStore((state) => state.camera);
  const setCamera = useCanvasStore((state) => state.setCamera);
  const selectedObjectIds = useCanvasStore((state) => state.selectedObjectIds);
  const selectObject = useCanvasStore((state) => state.selectObject);
  const activeTool = useCanvasStore((state) => state.activeTool);
  const setActiveTool = useCanvasStore((state) => state.setActiveTool);
  const shapeType = useCanvasStore((state) => state.shapeType);
  const currentColor = useCanvasStore((state) => state.currentColor);
  const strokeColor = useCanvasStore((state) => state.strokeColor);

  const connectionStatus = useRoomStore((state) => state.connectionStatus);
  const isOnline = useRoomStore((state) => state.isOnline);
  const connectedUsers = useRoomStore((state) => state.connectedUsers);
  const addToast = useUIStore((state) => state.addToast);
  const showMiniMap = useUIStore((state) => state.showMiniMap);

  // Center camera view on origin (0,0) on room load
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCamera({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        scale: 1.0,
      });
    }
  }, [setCamera]);

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
  const { objects, awareness, addObject, updateObject, deleteObject, undo, redo } = useYjs(
    roomId,
    localUser,
  );

  // Handle keyboard shortcuts (Delete/Backspace/Undo/Redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger canvas shortcuts if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Undo (Ctrl+Z or Cmd+Z) / Redo (Ctrl+Shift+Z or Cmd+Shift+Z)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }

      // Delete selected objects
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedObjectIds.length > 0
      ) {
        selectedObjectIds.forEach((id) => deleteObject(id));
        useCanvasStore.getState().clearSelection();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedObjectIds, deleteObject, undo, redo]);

  // Record snapshots whenever objects change
  useEffect(() => {
    if (objects.length === 0) return;
    setSnapshots((prev) => {
      const snap = createSnapshot(objects, localUser?.username || "Guest");
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
    addToast({ type: "success", message: "Room link copied to clipboard!" });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Handle adding objects from Toolbar with Smart Staggered Position
  const handleAddObjectFromToolbar = (
    type: string,
    extraData?: Record<string, unknown>,
  ) => {
    const centerScreen = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };
    const worldCenter = screenToWorld(centerScreen, camera);

    const staggerOffset = (objects.length * 30) % 240;
    const spawnPos = {
      x: worldCenter.x + staggerOffset,
      y: worldCenter.y + staggerOffset,
    };

    const newObj = addObject(type, spawnPos, { fill: currentColor, stroke: strokeColor, ...extraData });
    if (newObj?.id) selectObject(newObj.id);
  };

  // Handle clicking empty canvas space to place active creation tool
  const handleStageClick = (e: any) => {
    const stage = e.target?.getStage();
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    if (
      activeTool === "text" ||
      activeTool === "shape" ||
      activeTool === "sticky"
    ) {
      const worldPos = screenToWorld(pointer, camera);
      const newObj = addObject(activeTool, worldPos, { shapeType, fill: currentColor, stroke: strokeColor });
      if (newObj?.id) selectObject(newObj.id);
      setActiveTool("select");
    }
  };

  // Zoom handlers
  const handleZoom = (factor: number) => {
    const newScale = Math.min(Math.max(camera.scale * factor, 0.1), 5.0);
    setCamera({ ...camera, scale: newScale });
  };

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-background text-on-surface flex flex-col select-none"
      onMouseMove={handleMouseMove}
    >
      {/* STITCH RESPONSIVE TOP HEADER */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-outline-variant/30 shadow-sm flex justify-between items-center h-16 px-4 md:px-6 w-full fixed top-0 z-50">
        <div className="flex items-center gap-3 md:gap-6">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-primary font-bold text-lg cursor-pointer"
          >
            <Image src="/logo.png" width={32} height={32} alt="Logo" />
          </button>

          <div className="h-6 w-px bg-outline-variant/50 hidden sm:block" />

          {/* Room ID Badge */}
          <div className="bg-surface-container px-3 py-1 rounded-full text-primary font-bold text-xs md:text-sm">
            Room: #{roomId}
          </div>

          {/* Connection Status Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-container rounded-full border border-outline-variant/30 text-xs">
            {!isMounted ? (
              <span className="hidden md:inline font-medium text-slate-500">
                connecting
              </span>
            ) : connectionStatus === "connected" && isOnline ? (
              <>
                <CloudDoneIcon
                  className="text-emerald-500"
                  fontSize="inherit"
                />
                <span className="hidden md:inline font-medium text-emerald-600">
                  Connected
                </span>
              </>
            ) : (
              <>
                <CloudOffIcon className="text-amber-500" fontSize="inherit" />
                <span className="hidden md:inline font-medium text-amber-600">
                  {!isOnline ? "Offline" : connectionStatus}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right Nav Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* User Avatars Stack */}
          <div
            className="flex items-center -space-x-2 mr-1 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setShowUsersModal(true)}
            title="View all users in room"
          >
            <div className="w-8 h-8 rounded-full border-2 border-white bg-primary flex items-center justify-center text-white text-xs font-bold shadow-sm relative group">
              {localUser?.username?.[0]?.toUpperCase() || "G"}
              <div className="absolute top-10 whitespace-nowrap bg-on-surface text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {localUser?.username || "Guest"} (You)
              </div>
            </div>
            {connectedUsers
              .filter((u) => !u.isLocal)
              .slice(0, 2)
              .map((u) => (
                <div
                  key={u.clientId}
                  className="w-8 h-8 rounded-full border-2 border-white bg-tertiary flex items-center justify-center text-white text-xs font-bold shadow-sm relative group"
                >
                  {u.username?.[0]?.toUpperCase() || "U"}
                  <div className="absolute top-10 whitespace-nowrap bg-on-surface text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {u.username}
                  </div>
                </div>
              ))}
            {connectedUsers.filter((u) => !u.isLocal).length > 2 && (
              <div className="w-8 h-8 rounded-full border-2 border-white bg-surface-container-high flex items-center justify-center text-on-surface-variant text-xs font-bold shadow-sm">
                +{connectedUsers.filter((u) => !u.isLocal).length - 2}
              </div>
            )}
          </div>

          {/* Time-Travel Button */}
          <button
            onClick={() => {
              setIsReplaying(!isReplaying);
              setSnapshotIndex(Math.max(0, snapshots.length - 1));
            }}
            className={`p-2 rounded-full transition-all active:scale-95 ${
              isReplaying
                ? "bg-amber-100 text-amber-700"
                : "text-on-surface-variant hover:bg-surface-container-high"
            }`}
            title="Time Travel Replay"
          >
            <HistoryIcon />
          </button>

          {/* Shortcuts Guide Button */}
          <button
            onClick={() => setShowShortcutsModal(true)}
            className="p-2 text-on-surface-variant hover:bg-surface-container-high transition-all rounded-full active:scale-95 hidden sm:block"
            title="Shortcuts Guide"
          >
            <HelpIcon />
          </button>

          {/* Export Menu Dropdown */}
          <ExportMenu
            objects={objects}
            roomId={roomId}
            onImportObjects={(imported) => {
              imported.forEach((obj) => {
                addObject(
                  obj.type,
                  { x: obj.x, y: obj.y },
                  (obj.data as unknown as Record<string, unknown>) || {},
                );
              });
              addToast({
                type: "success",
                message: `Imported ${imported.length} objects!`,
              });
            }}
          />

          {/* Share Button */}
          <button
            onClick={copyInviteLink}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-on-primary-fixed-variant text-white font-medium text-xs md:text-sm rounded-lg transition-all shadow-md active:scale-95"
          >
            <ShareIcon fontSize="small" />
            <span className="hidden sm:inline">
              {copiedLink ? "Copied!" : "Share"}
            </span>
          </button>
        </div>
      </header>

      {/* Main Canvas Component Surface */}
      <div className="flex-1 w-full h-full relative pt-16">
        <CanvasStage
          objects={
            isReplaying && snapshots[snapshotIndex]
              ? snapshots[snapshotIndex].objects
              : objects
          }
          selectedObjectIds={selectedObjectIds}
          onSelectObject={(id, multi) => selectObject(id, multi)}
          onUpdateObject={(id, attrs) => updateObject(id, attrs)}
          onStageClick={handleStageClick}
        />

        {/* Live User Presence Cursors Overlay */}
        <CursorOverlay users={remoteUsers} camera={camera} />

        {/* Off-Screen Peer Spatial Radar */}
        <PeerRadar users={remoteUsers} camera={camera} />

        {/* Offline Notification Banner */}
        <OfflineBanner />

        {/* Real-Time Floating Toast Notifications */}
        <ToastContainer />

        {/* Keyboard Shortcuts Guide Modal */}
        <KeyboardShortcutsModal
          isOpen={showShortcutsModal}
          onClose={() => setShowShortcutsModal(false)}
        />

        {/* Time-Travel Session Replay Timeline Scrubber Bar */}
        {isReplaying && (
          <TimeTravelBar
            snapshots={snapshots}
            currentIndex={snapshotIndex}
            onSelectSnapshot={(index) => setSnapshotIndex(index)}
            onClose={() => setIsReplaying(false)}
          />
        )}

        {/* Responsive Creative Toolbar (Desktop left bar + Mobile bottom bar) */}
        <Toolbar onAddObject={handleAddObjectFromToolbar} />

        {/* Zoom Controls (Bottom Left, horizontal pill next to toolbar) */}
        <div className="fixed bottom-8 left-24 md:left-28 z-40 flex">
          <div className="flex flex-row items-center rounded-full p-1 border border-primary/20 shadow-lg bg-white/95 backdrop-blur-md">
            <button
              onClick={() => handleZoom(0.8)}
              className="w-9 h-9 flex items-center justify-center text-primary hover:bg-primary/10 rounded-full active:scale-95 transition-all"
              title="Zoom Out"
            >
              <RemoveIcon fontSize="small" />
            </button>
            <div className="text-center font-bold text-[12px] px-3 text-slate-800">
              {Math.round(camera.scale * 100)}%
            </div>
            <button
              onClick={() => handleZoom(1.2)}
              className="w-9 h-9 flex items-center justify-center text-primary hover:bg-primary/10 rounded-full active:scale-95 transition-all"
              title="Zoom In"
            >
              <AddIcon fontSize="small" />
            </button>
          </div>
        </div>

        {/* Bottom-Right Mini-Map Widget (Visible if toggled or on desktop) */}
        {showMiniMap && (
          <div className="fixed bottom-24 md:bottom-6 right-4 z-40">
            <MiniMap objects={objects} users={remoteUsers} />
          </div>
        )}
      </div>

      {/* Guest Authentication Join Modal */}
      <JoinModal
        isOpen={showJoinModal}
        roomId={roomId}
        onJoin={(user) => {
          setLocalUser(user);
          setShowJoinModal(false);
          addToast({
            type: "success",
            message: `Welcome to room ${roomId}, ${user.username}!`,
          });
        }}
      />

      {/* Connected Users Modal */}
      <Modal
        isOpen={showUsersModal}
        onClose={() => setShowUsersModal(false)}
        title="👥 People in this Room"
        maxWidth="sm"
      >
        <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-2">
          {/* Local User */}
          <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/20">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
              {localUser?.username?.[0]?.toUpperCase() || "G"}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-on-surface">
                {localUser?.username || "Guest"}{" "}
                <span className="text-primary text-xs font-normal bg-primary/10 px-1.5 py-0.5 rounded ml-1">
                  You
                </span>
              </span>
              <span className="text-xs text-on-surface-variant">
                Active now
              </span>
            </div>
          </div>

          {/* Remote Users */}
          {connectedUsers
            .filter((u) => !u.isLocal)
            .map((u) => (
              <div
                key={u.clientId}
                className="flex items-center gap-3 p-3 bg-surface-container rounded-xl border border-outline-variant/30"
              >
                <div className="w-10 h-10 rounded-full bg-tertiary flex items-center justify-center text-white font-bold">
                  {u.username?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-sm text-on-surface">
                    {u.username}
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    Connected
                  </span>
                </div>
              </div>
            ))}

          {connectedUsers.filter((u) => !u.isLocal).length === 0 && (
            <p className="text-sm text-on-surface-variant text-center py-4">
              No one else is here yet.
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}
