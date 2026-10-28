import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the dev badge out of screenshots and reel recordings.
  devIndicators: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  experimental: {
    serverActions: { bodySizeLimit: "20mb" },
  },
};

export default nextConfig;
