import type { NextConfig } from "next";

// The browser talks only to this origin; /api/v1 is proxied to the Express API.
// That keeps the httpOnly refresh cookie on the same site (no cross-site cookie problems).
const apiBase = process.env.API_BASE_URL ?? "http://localhost:5000";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
  async rewrites() {
    return [{ source: "/api/v1/:path*", destination: `${apiBase}/api/v1/:path*` }];
  },
};

export default nextConfig;
