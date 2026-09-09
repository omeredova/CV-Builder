import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ["page.tsx", "page.ts"],
  images: {
    remotePatterns: [
      {
        hostname: "res.cloudinary.com",
        pathname: "/cv-gen-cloud/image/upload/**",
        protocol: "https",
      },
      {
        hostname: "res.cloudinary.com",
        pathname: "/ze7hzrlr/image/upload/**",
        protocol: "https",
      },
    ],
  },
  reactStrictMode: true,
};

export default nextConfig;
