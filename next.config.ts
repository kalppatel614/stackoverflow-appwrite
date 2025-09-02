import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["node-appwrite"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
