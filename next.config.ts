import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Native module: load it at runtime instead of bundling it.
  serverExternalPackages: ["better-sqlite3"],
  // The brief names GET /feed, POST /swipe and GET /matches. The handlers live under /api,
  // so serve the plain paths as aliases of them.
  async rewrites() {
    return [
      { source: "/feed", destination: "/api/feed" },
      { source: "/swipe", destination: "/api/swipe" },
      { source: "/matches", destination: "/api/matches" },
    ];
  },
};

export default nextConfig;
