# 🎨 CollabCanvas: Real-Time Collaborative Infinite Canvas

CollabCanvas is a high-performance web platform that allows multiple users to work together on a massive, infinite 2D surface in real time. Designed for a hackathon, it goes beyond standard digital whiteboards (like Figma or Miro) by introducing deep creative tools, interactive physics, time-travel session replays, and offline-first capabilities.

## 🚀 Hackathon Features & Technical Requirements Met

### 📌 Mandatory MVP Features
- **Real-Time Collaboration**: Powered by `Yjs` (CRDTs) and a custom Node.js `y-websocket` server, ensuring zero-conflict, real-time synchronization between multiple users.
- **Massive 2D Infinite Surface**: Infinite scrolling with smooth panning and zooming. Built on top of `react-konva` with an optimized rendering pipeline.
- **High Performance (100+ Objects)**: Uses spatial hashing/indexing (`rbush`) for viewport culling and efficient rendering of hundreds of objects simultaneously.
- **Multiple Object Types**: Seamlessly create and manipulate:
  - 📝 **Text**
  - 🔺 **Shapes**
  - 🖼️ **Images**
  - 📌 **Sticky Notes**
  - 🎤 **Audio Recordings** (with waveform visualization)
- **Room Creation & Sharing**: Instantly generate unique rooms and share the URL for frictionless collaboration.
- **Simple Authentication**: Guest mode with username selection before joining a room.
- **Responsive Design**: The UI, properties panel, and toolbars adapt gracefully to mobile and desktop viewports.

### 🌟 Creative Technical Features (High Score Tier)
1. **Physics & Interactions (`Matter.js`)**:
   - Objects are backed by a robust physics engine! Enable physics mode to throw objects with inertia, watch them bounce, and collide with realistic restitution and friction.
   - **Force Fields**: Set objects to emit Attraction or Repulsion fields, creating dynamic gravity systems within the canvas.
2. **Mini-Map + Radar**:
   - A real-time viewport mini-map provides an overview of the entire workspace.
   - **Peer Radar**: Visually tracks the real-time mouse cursors and viewport locations of all other users in the room.
3. **Offline Support (Local-First)**:
   - Changes are persisted locally via `y-indexeddb`. 
   - If you drop connection, you can continue working smoothly. All changes automatically sync and resolve the moment you get back online.

### 🔥 Bonus Features
1. **Multi-Format Export**: 
   - Export your masterpiece or select portions of the canvas to **PNG**, **SVG**, or **JSON**.
2. **Time-Travel Replay**:
   - Relive the creative process. The built-in Time-Travel feature captures historical snapshots of the canvas, allowing you to playback the entire session from the beginning with a scrubber and variable playback speeds.

---

## 🛠️ Tech Stack
- **Frontend**: Next.js 15 (React 19), Tailwind CSS, Zustand (State Management)
- **Canvas Rendering**: Konva, react-konva
- **Physics**: Matter.js
- **Real-Time Sync (CRDTs)**: Yjs, y-websocket, y-indexeddb
- **Backend / Database**: Node.js (Custom Server), Prisma, PostgreSQL
- **Caching / PubSub**: Redis
- **Containerization**: Docker & Docker Compose

---

## 📦 Local Development Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org/en/) (v22+ recommended)
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- [Docker & Docker Compose](https://www.docker.com/) (Optional, but highly recommended for PostgreSQL/Redis)

### 2. Environment Variables
Copy `.env.example` to `.env` and configure your database and Redis connections:
```bash
cp .env.example .env
```
*(Default values in `.env.example` assume you are running the provided Docker Compose stack).*

### 3. Start Database & Redis (via Docker)
```bash
docker compose up postgres redis -d
```
*Note: This starts only the supporting services. You can also run the entire app via Docker (see below).*

### 4. Install Dependencies
```bash
pnpm install
```

### 5. Setup Database
Push the Prisma schema to your PostgreSQL database:
```bash
pnpm db:push
```

### 6. Start the Development Server
```bash
pnpm dev
```
The app will be available at [http://localhost:3000](http://localhost:3000).

---

## 🐳 Running Completely via Docker

If you want to run the entire application (App, Postgres, Redis) via Docker without installing local dependencies:

```bash
docker compose up --build -d
```
The custom `server.js` automatically runs `npx prisma db push --skip-generate` on startup, meaning no manual database migrations are required! The app will be accessible at `http://localhost:3000`.

---

## 🧪 Testing

We use **Vitest** for unit tests and **Playwright** for end-to-end testing.

```bash
# Run Unit Tests
pnpm test

# Run Unit Tests in Watch Mode
pnpm test:watch

# Run E2E Tests (requires Playwright browsers to be installed)
pnpm test:e2e
```

## 📂 Key Directory Structure

- `/src/components/canvas`: Core infinite canvas rendering, `react-konva` layers, spatial indexing, and `Matter.js` physics integration.
- `/src/hooks`: Custom hooks managing Yjs synchronization (`useYjs`), physics engine loop (`usePhysics`), and canvas interactions.
- `/src/lib/yjs`: CRDT document setup, IndexedDB persistence, and awareness (cursor/radar) tracking.
- `/src/lib/timetravel`: Snapshot capturing logic and history state management for session replays.
- `/server.js`: Custom Next.js + `y-websocket` server to handle both HTTP and WebSocket connections on the same port.
