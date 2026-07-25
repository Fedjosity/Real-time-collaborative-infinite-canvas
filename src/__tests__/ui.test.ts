/**
 * =============================================================================
 * UI Systems & Toast Store Unit Tests
 * =============================================================================
 *
 * Tests for UI state management, Toast notifications, and modal controls.
 *
 * @module __tests__/ui.test
 */

import { describe, it, expect } from 'vitest';
import { useUIStore } from '@/store/uiStore';

describe('UI Store & Toast System', () => {
  it('adds toast notifications to store queue', () => {
    const { addToast, removeToast } = useUIStore.getState();

    addToast({ type: 'success', message: 'Test success toast' });

    let toasts = useUIStore.getState().toasts;
    expect(toasts.length).toBeGreaterThan(0);
    expect(toasts[toasts.length - 1]?.message).toBe('Test success toast');

    // Clean up
    const id = toasts[toasts.length - 1]?.id;
    if (id) removeToast(id);
  });

  it('removes toast notifications cleanly from store', () => {
    const { addToast, removeToast } = useUIStore.getState();
    addToast({ type: 'info', message: 'Temp toast' });

    const toastId = useUIStore.getState().toasts.slice(-1)[0]?.id;
    expect(toastId).toBeDefined();

    if (toastId) {
      removeToast(toastId);
      const exists = useUIStore.getState().toasts.some((t) => t.id === toastId);
      expect(exists).toBe(false);
    }
  });
});
