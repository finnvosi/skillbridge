import { NextResponse } from 'next/server';

// Security headers applied to every response. These are the cheap, high-impact
// "protect" layer: they stop clickjacking, MIME sniffing, most XSS, and downgrade
// attacks. CSP is intentionally strict but allows inline styles/scripts from the
// Next.js app itself (adjust as you add third-party origins).
const securityHeaders = {
  // Block resources from loading over HTTP once a user has visited via HTTPS.
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  // Stop the page being framed (clickjacking).
  'X-Frame-Options': 'DENY',
  // Block MIME sniffing.
  'X-Content-Type-Options': 'nosniff',
  // Referrer only sent on same-origin requests.
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  // Baseline anti-XSS. 'report' mode is safer for an MVP — flip to 'enforce'
  // once you've confirmed no false positives in your CSP.
  'Content-Security-Policy':
    "default-src 'self'; " +
    "img-src 'self' data: blob: https://*.supabase.co; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co; " +
    "style-src 'self' 'unsafe-inline'; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https://*.supabase.co https://*.supabase.in; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'",
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
};

export async function middleware() {
  const response = NextResponse.next();

  // Attach security headers to all responses.
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }

  return response;
}

export const config = {
  // Run on pages + API routes (but not Next internals / static assets).
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
