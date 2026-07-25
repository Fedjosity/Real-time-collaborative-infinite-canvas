import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CollabCanvas — Real-Time Collaborative Infinite Canvas",
  description:
    "A high-performance infinite 2D canvas with real-time CRDT sync, Matter.js physics engine, time-travel replay, audio notes, and multi-format export.",
  keywords: [
    "infinite canvas",
    "real-time collaboration",
    "physics engine",
    "time travel replay",
    "interactive canvas",
  ],
  authors: [{ name: "Fedjost Ayomide" }],
  openGraph: {
    title: "CollabCanvas — Real-Time Collaborative Infinite Canvas",
    description:
      "Collaborate on a massive 2D surface with physics, creative tools, and live presence.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#f8f9fa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
