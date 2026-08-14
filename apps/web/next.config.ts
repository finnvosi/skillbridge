import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React Compiler is auto-enabled by Next 16 when present; it currently
  // crashes prerendering internal routes (_global-error/_not-found) with a
  // `useContext null` error on this Node/React combo. Disable until fixed.
  reactCompiler: false,
  reactStrictMode: false,
  // Rewrites /api/v1/* to the backend.
  // The web client is configured with NEXT_PUBLIC_API_URL=/api/v1 (same-origin),
  // so browser requests stay on the Next.js origin and Next proxies them here
  // server-side to the Express API. This avoids all cross-origin CORS issues.
  // API_PROXY_TARGET is the bare API origin; fall back to NEXT_PUBLIC_API_URL
  // (or localhost in dev) if it isn't set.
  async rewrites() {
    const raw =
      process.env.API_PROXY_TARGET ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:3001";
    const apiBase = raw.replace(/\/api\/v1\/?$/, "");
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiBase}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
