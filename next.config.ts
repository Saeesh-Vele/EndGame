import type { NextConfig } from "next";

// Villa photos uploaded through the admin dashboard are served from this
// project's Supabase Storage CDN, so next/image has to be told that host is
// allowed. Derived from the env var rather than hardcoded — the hostname is
// project-specific and differs between local, staging, and production.
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  images: {
    // AVIF first, WebP as the fallback for browsers without AVIF support.
    // Next's default is ['image/webp'] alone, so without this every
    // AVIF-capable browser was being served the larger WebP.
    formats: ["image/avif", "image/webp"],

    // Next 16 changed the default to [75] and *silently coerces* any other
    // `quality` prop to the nearest allowed value, so every quality used in
    // the app has to be listed here or it is quietly ignored.
    //   60 — small admin thumbnails (56-120px chrome, not product imagery)
    //   65 — the hero, which sits behind a heavy dark scrim
    //   75 — Next's default; all villa photography stays here
    qualities: [60, 65, 75],

    // Villa photos are immutable once uploaded (a new upload gets a new
    // storage key), so re-optimising them every 4 hours is wasted work.
    minimumCacheTTL: 2678400, // 31 days

    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      ...(supabaseHostname
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHostname,
              port: "",
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
