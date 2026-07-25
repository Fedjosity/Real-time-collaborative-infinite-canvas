# 🎨 CollabCanvas — Real-Time Collaborative Infinite Canvas

A high-performance, production-grade platform allowing multiple users to collaborate on a massive 2D infinite surface in real-time. Built with creative tools and interactive features that go beyond traditional whiteboards, including a **Matter.js 2D Physics Engine**, **CRDT State Sync**, **Time-Travel Session Replay**, **Server-Side Audio Recording**, **Mini-Map Radar**, **Offline Support**, and **Multi-Format Export**.

---

## ✨ Features & Technical Highlights

### ⚡ Core Collaborative MVP
- **Massive 2D Infinite Surface**: Smooth pan and pinch-zoom with viewport spatial culling (rbush R-tree index) supporting 100+ concurrent canvas objects at 60 FPS.
- **Real-Time CRDT Sync**: Powered by `Yjs` and `y-websocket` for conflict-free multi-user editing with automatic state convergence.
- **Rich Object System**: Text blocks, geometric shapes (rectangle, circle, triangle, star, arrow, diamond, hexagon), sticky notes with color palettes, drag-and-drop images, and audio widgets.
- **Guest Authentication**: Simple guest mode with customizable display names, device ID persistence, and 20 distinct presence cursor colors.
- **Live User Presence**: View real-time user cursors with smooth linear interpolation (lerp) and active user indicators.

### 🚀 Hackathon Creative & Technical Innovations
1. **Matter.js Physics & Interactions**: Global 2D physics engine toggle — canvas objects can be thrown with gesture velocity, collide, attract, and repel each other.
2. **Mini-Map & Radar**: Real-time minimap overlay showing spatial positions of all canvas objects and live viewport bounds of other connected users.
3. **Offline Resilience**: Automatic local persistence via `y-indexeddb`. Users can keep editing offline and changes automatically diff-sync upon reconnecting.
4. **Time-Travel Session Replay**: Session recorder and player with timeline scrubber and speed controls (0.5x, 1x, 2x, 4x) to replay sessions from the beginning.
5. **Server-Side Audio Recording**: Record voice notes directly on the canvas using the `MediaRecorder` API, uploaded to server storage with Prisma metadata tracking.
6. **Multi-Format Export**: Export canvas sessions to high-res PNG images, vector SVG files, or portable JSON state files.

---

## 🛠️ Tech Stack

| Layer | Technology |
|:---|:---|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript (Strict Mode) |
| **Package Manager** | `pnpm` v9 |
| **Canvas Engine** | Konva.js + `react-konva` |
| **Physics Engine** | Matter.js 2D |
| **Real-Time Sync** | Yjs + `y-websocket` (CRDTs) |
| **Offline Persistence** | `y-indexeddb` (IndexedDB) |
| **Database** | PostgreSQL + Prisma ORM |
| **Cache & Pub/Sub** | Redis (`ioredis`) |
| **State Management** | Zustand |
| **Styling** | Tailwind CSS v4 + Glassmorphism tokens |
| **Testing** | Vitest (Unit) + Playwright (E2E) |
| **Containerization** | Docker & Docker Compose |

---

## 📦 Prerequisites

Before starting, ensure you have installed:
- [Node.js](https://nodejs.org/) (v20.0 or higher)
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for containerized setup)

---

## ⚙️ Environment Configuration

Create a `.env` file in the root directory (or use the included default):

```env
# Server Configuration
PORT=3000
HOSTNAME=localhost
NODE_ENV=development

# PostgreSQL Database (Prisma)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/collabcanvas?schema=public"

# Redis Cache & Pub/Sub
REDIS_URL="redis://localhost:6379"

# File Uploads Directory
UPLOAD_DIR="uploads"
MAX_UPLOAD_SIZE=10485760
```

---

## 🚀 Quick Start & Setup Options

### Option A: Run Full Stack with Docker Desktop (Recommended for Production/Evaluation)

Run the entire application (Next.js server + WebSockets + PostgreSQL + Redis) using Docker Compose:

1. **Launch Docker Desktop**.
2. **Start all containers**:
   ```bash
   pnpm docker:up
   ```
   *(Alternative: `docker compose up -d`)*

3. **Access the application**:
   - Web App & Real-Time Server: `http://localhost:3000`
   - Server Health Check: `http://localhost:3000/health`

4. **Stop containers**:
   ```bash
   pnpm docker:down
   ```

---

### Option B: Local Development Mode (Hot-Reloading)

If you are modifying code and want instant hot-reloading:

1. **Start PostgreSQL & Redis in Docker Desktop**:
   ```bash
   docker compose up -d postgres redis
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Push Prisma database schema**:
   ```bash
   pnpm db:push
   ```

4. **Start the local development server**:
   ```bash
   pnpm dev
   ```

5. **Open `http://localhost:3000`** in your browser.

---

## 🧪 Testing & Quality Assurance

### Run Unit Tests
Powered by Vitest with `jsdom` DOM environment:
```bash
pnpm test
```

### Type Checking
Run strict TypeScript compilation check:
```bash
pnpm type-check
```

### Run End-to-End Tests
Powered by Playwright:
```bash
pnpm test:e2e
```

---

## 📂 Project Architecture

```
Real-time-collaborative infinite canvas/
├── Dockerfile                         # Multi-stage Docker container setup
├── docker-compose.yml                 # Docker Compose (App + Postgres + Redis)
├── package.json                       # Dependencies, scripts, pnpm config
├── server.js                          # Custom Node.js HTTP + Yjs WebSocket server
├── next.config.ts                     # Next.js configuration
├── postcss.config.mjs                 # Tailwind CSS v4 PostCSS setup
├── vitest.config.ts                   # Vitest unit test configuration
├── prisma/
│   └── schema.prisma                  # Room, Session, and AudioFile models
├── src/
│   ├── app/                           # Next.js App Router pages & API routes
│   │   ├── layout.tsx                 # Root layout & meta tags
│   │   ├── globals.css                # Tailwind imports & CSS variable design tokens
│   │   ├── page.tsx                   # Cyberpunk landing page
│   │   ├── room/[roomId]/page.tsx     # Canvas room page
│   │   └── api/
│   │       ├── rooms/route.ts         # Room creation API
│   │       └── audio/route.ts         # Server-side audio upload/download API
│   ├── components/
│   │   ├── auth/                      # JoinModal guest auth component
│   │   ├── canvas/                    # Infinite Canvas stage & object renderers
│   │   ├── panels/                    # MiniMap, TimeTravel, Export & UserList panels
│   │   ├── toolbar/                   # Floating toolbar & physics controls
│   │   └── ui/                        # Reusable Button, Input, Modal components
│   ├── hooks/                         # React custom hooks (canvas, Yjs, physics, audio)
│   ├── lib/                           # Core utilities (db, redis, yjs, physics, export, math)
│   ├── store/                         # Zustand state stores (canvas, room, ui)
│   └── types/                         # TypeScript interfaces (canvas, room, physics)
└── README.md
```

---

## 📜 Available Scripts

| Command | Description |
|:---|:---|
| `pnpm dev` | Starts the custom Node.js server (HTTP + WebSockets) in dev mode |
| `pnpm build` | Generates Prisma client and compiles production Next.js build |
| `pnpm start` | Runs the production server |
| `pnpm docker:up` | Spins up Docker containers for App, PostgreSQL, and Redis |
| `pnpm docker:down` | Stops all Docker containers |
| `pnpm db:push` | Pushes Prisma schema changes directly to PostgreSQL |
| `pnpm db:studio` | Opens visual Prisma Studio database manager |
| `pnpm type-check` | Runs TypeScript type checker without emitting code |
| `pnpm test` | Runs Vitest unit tests |
| `pnpm test:e2e` | Runs Playwright end-to-end tests |

---

## 📄 License

MIT License — Built for Hackathon Excellence.
