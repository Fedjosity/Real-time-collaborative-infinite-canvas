/**
 * =============================================================================
 * UI Store (Zustand)
 * =============================================================================
 *
 * Manages UI layout panels, modals, context menus, and toast notifications:
 * - Panel toggles (MiniMap, UserList, ExportPanel, TimeTravelPanel)
 * - Toast notifications (addToast, removeToast)
 * - Right-click context menu position & target
 *
 * @module store/uiStore
 */

import { create } from 'zustand';

export interface ToastNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  duration?: number;
}

export interface ContextMenuState {
  x: number;
  y: number;
  objectId: string | null;
}

export interface UIStoreState {
  /** Visibility of MiniMap & User Radar */
  showMiniMap: boolean;
  /** Visibility of User List panel */
  showUserList: boolean;
  /** Visibility of Export panel */
  showExportPanel: boolean;
  /** Visibility of Time Travel replay panel */
  showTimeTravelPanel: boolean;
  /** Visibility of Join Modal */
  showJoinModal: boolean;
  /** Active toast notifications */
  toasts: ToastNotification[];
  /** Context menu state */
  contextMenu: ContextMenuState | null;

  // Actions
  toggleMiniMap: () => void;
  setShowMiniMap: (show: boolean) => void;
  toggleUserList: () => void;
  setShowUserList: (show: boolean) => void;
  toggleExportPanel: () => void;
  setShowExportPanel: (show: boolean) => void;
  toggleTimeTravelPanel: () => void;
  setShowTimeTravelPanel: (show: boolean) => void;
  setShowJoinModal: (show: boolean) => void;
  addToast: (toast: Omit<ToastNotification, 'id'>) => void;
  removeToast: (id: string) => void;
  setContextMenu: (menu: ContextMenuState | null) => void;
  closeContextMenu: () => void;
}

export const useUIStore = create<UIStoreState>((set) => ({
  showMiniMap: true,
  showUserList: false,
  showExportPanel: false,
  showTimeTravelPanel: false,
  showJoinModal: false,
  toasts: [],
  contextMenu: null,

  toggleMiniMap: () => set((state) => ({ showMiniMap: !state.showMiniMap })),
  setShowMiniMap: (showMiniMap) => set({ showMiniMap }),

  toggleUserList: () => set((state) => ({ showUserList: !state.showUserList })),
  setShowUserList: (showUserList) => set({ showUserList }),

  toggleExportPanel: () => set((state) => ({ showExportPanel: !state.showExportPanel })),
  setShowExportPanel: (showExportPanel) => set({ showExportPanel }),

  toggleTimeTravelPanel: () =>
    set((state) => ({ showTimeTravelPanel: !state.showTimeTravelPanel })),
  setShowTimeTravelPanel: (showTimeTravelPanel) => set({ showTimeTravelPanel }),

  setShowJoinModal: (showJoinModal) => set({ showJoinModal }),

  addToast: (toastData) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastNotification = { ...toastData, id };

    set((state) => ({ toasts: [...state.toasts, newToast] }));

    // Auto-remove toast after duration (default 3000ms)
    const duration = toastData.duration ?? 3000;
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  setContextMenu: (contextMenu) => set({ contextMenu }),
  closeContextMenu: () => set({ contextMenu: null }),
}));
