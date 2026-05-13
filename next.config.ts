import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mimeyoi.co"
      }
    ]
  },
  turbopack: {
    root: __dirname
  }
};

export default nextConfig;
