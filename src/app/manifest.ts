import type { MetadataRoute } from "next";

/**
 * Served at /manifest.webmanifest. Next links it from <head> automatically,
 * so no manual <link rel="manifest"> is needed.
 *
 * The 192 and 512 "any" icons are the rounded-tile badge. The maskable one is
 * a separate full-bleed file: Android crops maskable icons to whatever shape
 * the launcher uses, so its artwork sits inside the centre 80% safe zone and
 * the background runs edge to edge.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "StayVilla — Handpicked Private Villas Across India",
    short_name: "StayVilla",
    description:
      "Book private villas across India. Every stay visited and verified in person, with direct host contact and zero service fees.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f4f0",
    theme_color: "#1b4d3e",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
