import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.GITHUB_ACTIONS ? "/TravelMate" : "",
  assetPrefix: process.env.GITHUB_ACTIONS ? "/TravelMate/" : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

