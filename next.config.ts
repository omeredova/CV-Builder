import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    VITE_GRAPHQL_URL: process.env.VITE_GRAPHQL_URL,
  },
  pageExtensions: ["page.tsx", "page.ts"],
  reactStrictMode: true,
};

export default nextConfig;
