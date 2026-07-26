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
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          text: 'text-emerald-800',
        };
      case 'error':
        return {
          icon: '✕',
          bg: 'bg-rose-50',
          border: 'border-rose-200',
          text: 'text-rose-800',
        };
      case 'warning':
        return {
          icon: '⚠',
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-800',
        };
      case 'info':
      default:
        return {
          icon: 'ℹ',
          bg: 'bg-primary/5',
          border: 'border-primary/20',
          text: 'text-primary',
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
            className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl ${style.bg} ${style.border} ${style.text} shadow-xl border transition-all duration-200 animate-in slide-in-from-right-5`}
          >
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-sm">{style.icon}</span>
              <span className="text-xs font-medium">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-outline-variant hover:text-white p-0.5 rounded transition-colors cursor-pointer"
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
