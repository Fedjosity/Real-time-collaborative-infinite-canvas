'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { USER_COLORS, getRandomUserColor } from '@/lib/utils/colors';
import { generateDeviceId } from '@/lib/utils/id';
import { STORAGE_KEYS, type LocalUser } from '@/types/room';

export interface JoinModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onJoin: (user: LocalUser) => void;
  roomId?: string;
}

export const JoinModal: React.FC<JoinModalProps> = ({
  isOpen,
  onClose,
  onJoin,
  roomId,
}) => {
  const [username, setUsername] = useState('');
  const [selectedColor, setSelectedColor] = useState('#6366F1');
  const [deviceId, setDeviceId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Load persisted local user or generate fresh defaults
    const stored = localStorage.getItem(STORAGE_KEYS.LOCAL_USER);
    if (stored) {
      try {
        const parsed: LocalUser = JSON.parse(stored);
        setUsername(parsed.username || '');
        setSelectedColor(parsed.color || getRandomUserColor());
        setDeviceId(parsed.deviceId || generateDeviceId());
        return;
      } catch (err) {
        console.warn('Failed to parse stored local user:', err);
      }
    }

    // Default fallback
    const randomGuestName = `Guest_${Math.floor(1000 + Math.random() * 9000)}`;
    setUsername(randomGuestName);
    setSelectedColor(getRandomUserColor());
    setDeviceId(generateDeviceId());
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) {
      setError('Username is required');
      return;
    }
    if (trimmed.length > 20) {
      setError('Username must be 20 characters or less');
      return;
    }

    const localUser: LocalUser = {
      username: trimmed,
      color: selectedColor,
      deviceId: deviceId || generateDeviceId(),
    };

    localStorage.setItem(STORAGE_KEYS.LOCAL_USER, JSON.stringify(localUser));
    onJoin(localUser);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose || (() => {})} title="Join Collaboration Room">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="text-sm text-slate-300">
          Enter your name and pick an accent color for your live cursor & avatar.
          {roomId && (
            <div className="mt-2 text-xs font-mono text-indigo-400 bg-indigo-950/60 p-2 rounded-lg border border-indigo-800/40">
              Room ID: {roomId}
            </div>
          )}
        </div>

        <Input
          label="Your Display Name"
          placeholder="e.g. Alex"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            if (error) setError('');
          }}
          error={error}
          autoFocus
        />

        {/* Color Picker Grid */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-slate-300 tracking-wide">
            Your Cursor & Presence Color
          </label>
          <div className="grid grid-cols-10 gap-2 p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
            {USER_COLORS.map((color, idx) => (
              <button
                key={`${color}-${idx}`}
                type="button"
                className={`w-6 h-6 rounded-full transition-all duration-150 cursor-pointer ${
                  selectedColor === color
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110'
                    : 'hover:scale-105 opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
          <Button type="submit" variant="primary" size="lg" className="w-full">
            🚀 Enter Canvas
          </Button>
        </div>
      </form>
    </Modal>
  );
};
