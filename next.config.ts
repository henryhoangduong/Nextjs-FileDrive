import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: `helpful-vole-383.convex.cloud`,
      },
      {
        protocol: "https",
        hostname: `helpful-vole-383.convex.site`,
      },
    ],
  },
};

export default nextConfig;
