import type { NextConfig } from "next";

const TUNNEL_HOST = "10zhwlr7-3000.asse.devtunnels.ms";

const nextConfig: NextConfig = {
  allowedDevOrigins: [TUNNEL_HOST],
  experimental: {
    agentFeedback: true,
    serverActions: {
      allowedOrigins: ["localhost:3000", TUNNEL_HOST],
    },
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
