/**
 * =============================================================================
 * CollabCanvas — Custom Node.js Server
 * =============================================================================
 *
 * This server handles TWO responsibilities on a single port:
 *
 * 1. HTTP:      Serves Next.js pages and API routes
 * 2. WebSocket: Yjs document synchronization for real-time collaboration
 *
 * Architecture:
 * ┌─────────────────────────────────────────────────────────┐
 * │  HTTP Server (port 3000)                                │
 * │  ├── GET/POST/* → Next.js request handler               │
 * │  ├── GET /health → Health check endpoint                 │
 * │  └── UPGRADE /yjs/:roomId → Yjs WebSocket sync          │
 * └─────────────────────────────────────────────────────────┘
 *
 * Why a custom server?
 * - Next.js serverless functions don't support persistent WebSocket connections
 * - Yjs requires a long-lived WebSocket for real-time CRDT sync
 * - We need both the Next.js frontend AND WebSocket on the same origin
 *   to avoid CORS issues
 *
 * @module server
 */

const { createServer } = require('http');
const { parse } = require('url');
const path = require('path');
const fs = require('fs');
const next = require('next');
const { WebSocketServer } = require('ws');

// ─── y-websocket server utility ──────────────────────────────────────────────
// setupWSConnection handles Yjs document sync: it reads the doc name from the
// URL, creates or retrieves the Y.Doc instance, and relays binary updates
// between connected clients.
const { setupWSConnection } = require('y-websocket/bin/utils');

// ─── Environment Configuration ──────────────────────────────────────────────
const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// ─── Ensure upload directory exists ─────────────────────────────────────────
const uploadDir = path.resolve(process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`[Server] Created upload directory: ${uploadDir}`);
}

// ─── Initialize Next.js ─────────────────────────────────────────────────────
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

/**
 * Tracks active WebSocket connections per room.
 * Used for monitoring, health checks, and cleanup.
 * @type {Map<string, Set<import('ws').WebSocket>>}
 */
const rooms = new Map();

// ─── Server Startup ─────────────────────────────────────────────────────────
app.prepare().then(() => {
  // ─── Create HTTP Server ─────────────────────────────────────────────────
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);

      // ─── Health Check Endpoint ────────────────────────────────────────
      // Returns server status, uptime, and room statistics.
      // Useful for monitoring and load balancer health probes.
      if (parsedUrl.pathname === '/health') {
        const totalConnections = [...rooms.values()].reduce(
          (sum, connections) => sum + connections.size,
          0
        );

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: Math.floor(process.uptime()),
            rooms: {
              active: rooms.size,
              totalConnections,
              list: [...rooms.entries()].map(([id, conns]) => ({
                id,
                connections: conns.size,
              })),
            },
            memory: {
              heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
              rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
            },
          })
        );
        return;
      }

      // ─── Next.js Request Handler ──────────────────────────────────────
      // Delegates all other HTTP requests to Next.js (pages + API routes)
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('[Server] Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  // ─── WebSocket Server (Yjs Collaboration) ─────────────────────────────
  // We use `noServer: true` so we can manually handle the HTTP→WebSocket
  // upgrade and route different paths to different handlers.
  const wss = new WebSocketServer({ noServer: true });

  /**
   * Handle HTTP → WebSocket upgrade requests.
   *
   * Route:
   * - /yjs/:roomId → Yjs document sync (our handler)
   * - Everything else → ignore (let Next.js HMR handle its own upgrades)
   */
  server.on('upgrade', (request, socket, head) => {
    const { pathname } = parse(request.url);

    if (pathname && pathname.startsWith('/yjs/')) {
      // Upgrade to WebSocket and hand off to Yjs
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
    // NOTE: We intentionally do NOT destroy the socket for other paths.
    // Next.js dev server needs its own WebSocket for Hot Module Replacement.
    // Non-handled upgrades will time out naturally.
  });

  /**
   * Handle new Yjs WebSocket connections.
   *
   * Flow:
   * 1. Extract room ID from the URL path (/yjs/:roomId)
   * 2. Register the connection in our rooms tracker
   * 3. Delegate to y-websocket's setupWSConnection for CRDT sync
   * 4. Clean up when the client disconnects
   */
  wss.on('connection', (conn, req) => {
    // Extract room ID: /yjs/abc123 → abc123
    const roomId = req.url.slice('/yjs/'.length).split('?')[0];

    if (!roomId) {
      console.warn('[WS] Connection attempt without room ID, closing');
      conn.close(4000, 'Room ID required');
      return;
    }

    console.log(`[WS] ✓ Client connected to room: ${roomId}`);

    // ─── Track connection ─────────────────────────────────────────────
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
      console.log(`[WS] 📦 Room created: ${roomId}`);
    }
    rooms.get(roomId).add(conn);

    const roomSize = rooms.get(roomId).size;
    console.log(`[WS] 👥 Room ${roomId}: ${roomSize} user(s) connected`);

    // ─── Set up Yjs sync ──────────────────────────────────────────────
    // setupWSConnection creates or retrieves a Y.Doc for this room,
    // syncs the current state to the new client, and starts relaying
    // binary updates between all clients in the same room.
    setupWSConnection(conn, req, {
      docName: roomId,
      gc: true, // Enable garbage collection for deleted CRDT content
    });

    // ─── Handle disconnection ─────────────────────────────────────────
    conn.on('close', (code, reason) => {
      console.log(
        `[WS] ✗ Client disconnected from room: ${roomId} (code: ${code})`
      );

      const roomConns = rooms.get(roomId);
      if (roomConns) {
        roomConns.delete(conn);

        if (roomConns.size === 0) {
          rooms.delete(roomId);
          console.log(
            `[WS] 🗑️  Room ${roomId} is empty — cleaned up`
          );
        } else {
          console.log(
            `[WS] 👥 Room ${roomId}: ${roomConns.size} user(s) remaining`
          );
        }
      }
    });

    // ─── Handle errors ────────────────────────────────────────────────
    conn.on('error', (err) => {
      console.error(`[WS] Error in room ${roomId}:`, err.message);
    });
  });

  // ─── Start Listening ──────────────────────────────────────────────────
  server.listen(port, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🎨  CollabCanvas Server                                  ║
║                                                            ║
║   Local:    http://${hostname}:${port}                         ║
║   WS:       ws://${hostname}:${port}/yjs/{roomId}              ║
║   Health:   http://${hostname}:${port}/health                  ║
║   Mode:     ${(dev ? 'development' : 'production').padEnd(14)}                         ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);
  });

  // ─── Graceful Shutdown ────────────────────────────────────────────────
  // Properly close all connections before exiting to prevent data loss.
  const shutdown = (signal) => {
    console.log(`\n[Server] ${signal} received — shutting down gracefully...`);

    // Notify and close all WebSocket connections
    let closedCount = 0;
    wss.clients.forEach((client) => {
      client.close(1001, 'Server shutting down');
      closedCount++;
    });
    console.log(`[Server] Closed ${closedCount} WebSocket connection(s)`);

    // Close the HTTP server (stops accepting new connections)
    server.close(() => {
      console.log('[Server] HTTP server closed');
      console.log('[Server] Goodbye! 👋');
      process.exit(0);
    });

    // Force exit after 10 seconds if graceful shutdown stalls
    setTimeout(() => {
      console.error('[Server] ⚠ Forced shutdown after 10s timeout');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
});
