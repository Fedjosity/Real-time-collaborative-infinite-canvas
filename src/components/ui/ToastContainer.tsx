'use client';

import React from 'react';
import { useUIStore, type ToastNotification } from '@/store/uiStore';

export const ToastContainer: React.FC = () => {
  const toasts = useUIStore((state) => state.toasts);
  const removeToast = useUIStore((state) => state.removeToast);

  if (toasts.length === 0) return null;

  const getStyle = (type: ToastNotification['type']) => {
    switch (type) {
      case 'success':
        return {
          icon: '✓',
          bg: 'bg-emerald-950/90',
          border: 'border-emerald-500/40',
          text: 'text-emerald-300',
        };
      case 'error':
        return {
          icon: '✕',
          bg: 'bg-rose-950/90',
          border: 'border-rose-500/40',
          text: 'text-rose-300',
        };
      case 'warning':
        return {
          icon: '⚠',
          bg: 'bg-amber-950/90',
          border: 'border-amber-500/40',
          text: 'text-amber-300',
        };
      case 'info':
      default:
        return {
          icon: 'ℹ',
          bg: 'bg-indigo-950/90',
          border: 'border-indigo-500/40',
          text: 'text-indigo-300',
        };
    }
  };

  return (
    <div className="fixed top-20 right-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-auto">
      {toasts.map((toast) => {
        const style = getStyle(toast.type);
        return (
          <div
            key={toast.id}
            className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl glass-panel ${style.bg} ${style.border} ${style.text} shadow-2xl border transition-all duration-200 animate-in slide-in-from-right-5`}
          >
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-sm">{style.icon}</span>
              <span className="text-xs font-medium text-slate-100">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-0.5 rounded transition-colors cursor-pointer"
              aria-label="Dismiss toast"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
};
