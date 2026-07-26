import type { Metadata } from "next";
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
  title: "StayVilla — Handpicked Private Villas Across India",
  description:
    "Handpicked private villas across India. Full privacy, no shared walls, just you and the view.",
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
