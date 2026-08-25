import type { Metadata, Viewport } from "next";
import { Instrument_Serif, DM_Sans, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import SessionProvider from "@/components/shared/SessionProvider";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: {
    // Used for the home page, which sets no title of its own.
    default: "StayVilla — Handpicked Private Villas Across India",
    // Every descendant segment sets a bare page name and gets the suffix
    // from here, so the brand half is defined in exactly one place.
    template: "%s | StayVilla",
  },
  description:
    "Handpicked private villas across India. Full privacy, no shared walls, just you and the view.",
  // The icons themselves are wired up by Next's file conventions:
  // app/favicon.ico, app/icon.svg, and app/apple-icon.png each emit their own
  // <link>, and app/manifest.ts emits <link rel="manifest">. Declaring
  // metadata.icons on top of those would duplicate the tags.
  appleWebApp: {
    // Lets an iOS home-screen launch run without Safari chrome, matching the
    // manifest's display: "standalone" on Android.
    capable: true,
    title: "StayVilla",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  // Paints the Android Chrome address bar and the iOS PWA status bar in the
  // brand forest. Lives on `viewport`, not `metadata` — Next moved themeColor
  // there and warns if it is set on metadata.
  themeColor: "#1b4d3e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(instrumentSerif.variable, dmSans.variable, "font-sans", geist.variable)}>
      <body className="font-body antialiased bg-linen text-charcoal">
        {/* Client auth state for the navbar and the save-villa hearts. Only
            the provider itself is a client component — `children` are passed
            through as-is and stay server components. */}
        <SessionProvider>{children}</SessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
