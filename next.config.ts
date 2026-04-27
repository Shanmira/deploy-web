"use server";
import type { NextConfig } from "next";
import "dotenv/config";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['172.17.228.191'],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
        search: "",
      },
    ],
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    ENCRYPTON_KEY: process.env.ENCRYPTON_KEY,
  },
  async redirects() {
    return [
      {
        source: "/pengaduan/",
        destination: "/pengaduan?mode=pengaduan", // Matched parameters can be used in the destination
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
