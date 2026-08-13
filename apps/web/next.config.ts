import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React Compiler is auto-enabled by Next 16 when present; it currently
  // crashes prerendering internal routes (_global-error/_not-found) with a
  // `useContext null` error on this Node/React combo. Disable until fixed.
  reactCompiler: false,
  reactStrictMode: false,
  // Rewrites /api/v1/* to the backend on port 3001 to avoid CSP issues in dev mode
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://localhost:3001/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;