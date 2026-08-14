import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React Compiler is auto-enabled by Next 16 when present; it currently
  // crashes prerendering internal routes (_global-error/_not-found) with a
  // `useContext null` error on this Node/React combo. Disable until fixed.
  reactCompiler: false,
  reactStrictMode: false,
  // Rewrites /api/v1/* to the backend.
  // - In dev, proxy to the local Express API on :3001 (avoids CSP issues).
  // - In prod, proxy to the deployed API project (NEXT_PUBLIC_API_URL). If the
  //   env is unset we fall back to localhost so local builds still work, but
  //   production MUST set NEXT_PUBLIC_API_URL to the skillbridge-api URL.
  async rewrites() {
    const apiBase =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiBase}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
