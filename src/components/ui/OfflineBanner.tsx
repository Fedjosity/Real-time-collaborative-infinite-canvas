'use client';

import React, { useState, useEffect } from 'react';

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Initial check
    setIsOffline(!navigator.onLine);

    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-2.5 rounded-2xl glass-panel bg-white/90 text-on-surface-variant border border-primary/40 shadow-2xl animate-in slide-in-from-top-5 duration-200">
      <div className="w-2.5 h-2.5 rounded-full bg-primary-container animate-ping" />
      <span className="text-xs font-semibold tracking-wide font-sans">
        You are working offline. Edits are saved locally & will sync when reconnected.
      </span>
    </div>
  );
};
