const Y = require("yjs");
const { WebsocketProvider } = require("y-websocket");
const WebSocket = require("ws");
const crypto = require("crypto");

const roomId = process.argv[2];
if (!roomId) {
  console.error("Usage: node scripts/stress-test.js <roomId>");
  process.exit(1);
}

const WS_URL = "ws://localhost:3000/yjs";

console.log(`Connecting to room ${roomId} at ${WS_URL}...`);

const doc = new Y.Doc();
const wsProvider = new WebsocketProvider(WS_URL, roomId, doc, {
  WebSocketPolyfill: WebSocket,
});

wsProvider.on("status", (event) => {
  if (event.status === "connected") {
    console.log("✅ Connected! Stress testing...");
    const objectsMap = doc.getMap("objects");
    const zIndexArray = doc.getArray("zIndexOrder");

    const totalObjects = 110;

    doc.transact(() => {
      for (let i = 0; i < totalObjects; i++) {
        const id = crypto.randomUUID().slice(0, 12);

        // Randomize shape types and colors
        const shapes = ["rectangle", "circle", "triangle", "star", "hexagon"];
        const colors = ["#0d99ff", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"];

        const shapeType = shapes[Math.floor(Math.random() * shapes.length)];
        const fill = colors[Math.floor(Math.random() * colors.length)];

        const obj = {
          id,
          type: "shape",
          x: Math.random() * 2000 - 1000,
          y: Math.random() * 2000 - 1000,
          width: 80,
          height: 80,
          rotation: Math.random() * 360,
          data: {
            shapeType,
            fill,
            stroke: "#0f172a",
            strokeWidth: 2,
            cornerRadius: 8,
            numPoints: 5,
            innerRadius: 0.5,
          },
          physics: {
            enabled: false,
            state: "resting",
            authority: null,
            velocity: { x: 0, y: 0 },
            angularVelocity: 0,
            mass: 1,
            friction: 0.1,
            frictionAir: 0.02,
            restitution: 0.6,
            isStatic: false,
            forceType: "none",
          },
          createdBy: "StressTestBot",
          createdAt: Date.now(),
          zIndex: Date.now() + i,
          locked: false,
          opacity: 1,
        };

        objectsMap.set(id, obj);
        zIndexArray.push([id]);
      }
    });

    console.log(
      `🔥 Successfully injected ${totalObjects} objects! Check the browser canvas.`,
    );

    setTimeout(() => {
      wsProvider.disconnect();
      process.exit(0);
    }, 2000);
  }
});
