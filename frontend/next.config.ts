import type { NextConfig } from "next";

// Content Security Policy
// This header tells the browser which resources are allowed to load.
// It's one of the most effective defenses against Cross-Site Scripting (XSS).
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: blob:;
  connect-src 'self' http://localhost:3001;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
`.replace(/\s{2,}/g, ' ').trim();

const securityHeaders = [
  // CSP: Restrict resource loading to prevent XSS
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy,
  },
  // Prevents browsers from MIME-sniffing away from the declared content-type
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // Clickjacking protection: Disallows embedding this page in iframes
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  // Controls referrer info sent with requests
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // HTTP Strict Transport Security: Forces HTTPS connections for 1 year
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
  // Prevents the browser from loading the page if XSS is detected (older browsers)
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  // Controls browser features & APIs that can be used
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(self)',
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
