/**
 * =============================================================================
 * Yjs Providers Setup (WebSocket + IndexedDB)
 * =============================================================================
 *
 * Configures real-time WebSocket sync and offline IndexedDB persistence:
 * 1. WebsocketProvider: Connects to custom Node.js server (`/yjs/:roomId`)
 * 2. IndexeddbPersistence: Saves every Y.Doc delta locally for offline resilience
 *
 * @module lib/yjs/provider
 */

import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { IndexeddbPersistence } from 'y-indexeddb';
import type { ConnectionStatus } from '@/types/room';

export interface YjsProviders {
  wsProvider: WebsocketProvider;
  idbProvider: IndexeddbPersistence;
  destroy: () => void;
}

export interface YjsProviderOptions {
  roomId: string;
  doc: Y.Doc;
  serverUrl?: string;
  onStatusChange?: (status: ConnectionStatus) => void;
  onSynced?: (isSynced: boolean) => void;
}

/**
 * Get WebSocket server endpoint URL dynamically based on environment or browser window location.
 */
export function getWebSocketServerUrl(): string {
  if (typeof window === 'undefined') {
    return 'ws://localhost:3000/yjs';
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/yjs`;
}

/**
 * Initialize WebSocket provider and IndexedDB offline provider for a Y.Doc.
 */
export function createYjsProviders({
  roomId,
  doc,
  serverUrl = getWebSocketServerUrl(),
  onStatusChange,
  onSynced,
}: YjsProviderOptions): YjsProviders {
  // 1. Local IndexedDB provider for offline support
  const idbProvider = new IndexeddbPersistence(roomId, doc);

  idbProvider.on('synced', () => {
    console.log(`[Yjs IDB] Local IndexedDB synced for room: ${roomId}`);
    if (onSynced) onSynced(true);
  });

  // 2. Real-Time WebSocket provider
  const wsProvider = new WebsocketProvider(serverUrl, roomId, doc, {
    connect: true,
    params: { roomId },
  });

  // Network Offline / Online Browser listeners for instant connection status feedback
  const handleOffline = () => {
    console.log('[Yjs WS] Browser network offline detected');
    if (onStatusChange) onStatusChange('disconnected');
  };

  const handleOnline = () => {
    console.log('[Yjs WS] Browser network online detected');
    if (onStatusChange) {
      onStatusChange(wsProvider.wsconnected ? 'connected' : 'connecting');
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
  }

  // Handle Connection Status events
  wsProvider.on('status', (event: { status: 'connecting' | 'connected' | 'disconnected' }) => {
    console.log(`[Yjs WS] Status change: ${event.status}`);
    if (onStatusChange) {
      const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
      if (!isOnline || event.status === 'disconnected') {
        onStatusChange('disconnected');
      } else if (event.status === 'connected') {
        onStatusChange('connected');
      } else {
        onStatusChange('connecting');
      }
    }
  });

  wsProvider.on('sync', (isSynced: boolean) => {
    console.log(`[Yjs WS] Room sync state: ${isSynced ? 'synced' : 'syncing'}`);
    if (onStatusChange) {
      const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
      if (!isOnline) {
        onStatusChange('disconnected');
      } else if (isSynced) {
        onStatusChange('connected');
      }
    }
  });

  const destroy = () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    }
    wsProvider.disconnect();
    wsProvider.destroy();
    idbProvider.destroy();
  };

  return {
    wsProvider,
    idbProvider,
    destroy,
  };
}
