"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { generateRoomId } from "@/lib/utils/id";
import Image from "next/image";

export default function LandingPage() {
  const router = useRouter();
  const [joinInput, setJoinInput] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [showJoinForm, setShowJoinForm] = useState(false);

  function navigateToRoom(id: string) {
    const cleanId = id
      .trim()
      .replace(/.*\/room\//, "")
      .replace(/[^a-zA-Z0-9_-]/g, "");
    if (!cleanId) {
      setJoinError("Please enter a valid Room ID");
      return;
    }
    router.push(`/room/${cleanId}`);
  }

  const handleCreateRoom = async () => {
    setIsCreating(true);
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Creative Studio Canvas" }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/room/${data.room.id}?new=1`);
      } else {
        const fallbackId = generateRoomId();
        router.push(`/room/${fallbackId}?new=1`);
      }
    } catch {
      const fallbackId = generateRoomId();
      router.push(`/room/${fallbackId}?new=1`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateToRoom(joinInput);
  };

  return (
    <div className="bg-surface text-on-surface overflow-x-hidden min-h-screen">
      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md border-b border-outline-variant shadow-sm">
        <nav className="flex justify-between items-center px-4 md:px-16 py-4 max-w-[1280px] mx-auto h-20">
          <div className="flex items-center gap-2 font-headline-md text-headline-md font-bold text-on-surface">
            <Image
              alt="CanvasFlow Logo"
              width={40}
              height={40}
              className="w-10 h-10 object-contain"
              src="/logo.png"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleCreateRoom}
              className="bg-primary text-on-primary px-6 py-2.5 rounded-lg text-sm font-semibold active:scale-95 transition-transform"
            >
              Get Started
            </button>
          </div>
        </nav>
      </header>

      <main className="pt-20">
        {/* Hero Section */}
        <section
          className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
          style={{
            backgroundImage:
              "radial-gradient(#c1c7d2 0.5px, transparent 0.5px)",
            backgroundSize: "24px 24px",
          }}
        >
          {/* Background Decorative Element */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#0061a5]/5 blur-[120px] rounded-full"></div>
            <div className="absolute inset-0 w-full h-full opacity-100">
              <div
                className="absolute top-[20%] left-[15%] flex items-center gap-2 px-3 py-1 bg-secondary rounded-full shadow-xl text-white text-xs animate-bounce"
                style={{ animationDuration: "3s" }}
              >
                <span className="material-symbols-outlined text-[16px]">
                  near_me
                </span>
                <span className="font-medium">Sarah (Lead Architect)</span>
              </div>
              <div
                className="absolute bottom-[20%] right-[20%] flex items-center gap-2 px-3 py-1 bg-[#6d43c6] rounded-full shadow-xl text-white text-xs animate-bounce"
                style={{ animationDuration: "4s" }}
              >
                <span className="material-symbols-outlined text-[16px]">
                  near_me
                </span>
                <span className="font-medium">Marcus (Design Exec)</span>
              </div>
            </div>
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-on-surface mb-6 tracking-tight">
              The Infinite Canvas for Creative Teams
            </h1>
            <p className="text-lg text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed">
              Break free from rigid grids. A high-performance spatial
              environment built for elite design executives and high-level
              architects.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleCreateRoom}
                disabled={isCreating}
                className="w-full sm:w-auto bg-primary text-on-primary px-10 py-4 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
              >
                {isCreating ? "Creating..." : "Create a Room"}
              </button>

              {!showJoinForm ? (
                <button
                  onClick={() => setShowJoinForm(true)}
                  className="w-full sm:w-auto border-2 border-primary text-primary px-10 py-4 rounded-lg font-semibold hover:bg-primary/5 transition-all active:scale-95"
                >
                  Join a Room
                </button>
              ) : (
                <form
                  onSubmit={handleJoinSubmit}
                  className="flex flex-col sm:flex-row gap-2.5 items-center w-full sm:w-auto"
                >
                  <input
                    type="text"
                    placeholder="Enter Room ID..."
                    value={joinInput}
                    onChange={(e) => {
                      setJoinInput(e.target.value);
                      if (joinError) setJoinError("");
                    }}
                    className="h-14 px-4 border border-outline-variant rounded-lg bg-white outline-none focus:border-primary text-on-surface w-full sm:w-64 shadow-sm"
                  />
                  <button
                    type="submit"
                    className="h-14 px-6 bg-secondary text-white rounded-lg font-semibold hover:bg-secondary/90 transition-all active:scale-95 w-full sm:w-auto"
                  >
                    Join
                  </button>
                </form>
              )}
            </div>
            {joinError && (
              <p className="text-error mt-3 text-sm">{joinError}</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
