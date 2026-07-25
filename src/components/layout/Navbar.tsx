"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const links = [
  { label: "Villas", href: "/villas" },
  { label: "Destinations", href: "/#destinations" },
  { label: "About", href: "#" },
];

export default function Navbar({ transparent = true }: { transparent?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!transparent) return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [transparent]);

  const isSolid = !transparent || scrolled;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-200 ${
        isSolid ? "bg-linen/95 backdrop-blur-sm shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-18 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 cursor-pointer"
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              className={isSolid ? "text-forest" : "text-white"}
            >
              <path
                d="M3 11L12 4L21 11"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5 10V19C5 19.5523 5.44772 20 6 20H18C18.5523 20 19 19.5523 19 19V10"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 20V15C10 14.4477 10.4477 14 11 14H13C13.5523 14 14 14.4477 14 15V20"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span
              className={`font-medium text-lg ${
                isSolid ? "text-charcoal" : "text-white"
              }`}
            >
              StayVilla
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-9">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`cursor-pointer text-sm font-normal transition-colors duration-200 ${
                  isSolid
                    ? "text-charcoal hover:text-forest"
                    : "text-white/90 hover:text-white"
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-6">
            <a
              href="#"
              className={`cursor-pointer text-sm transition-colors duration-200 ${
                isSolid
                  ? "text-charcoal hover:text-forest"
                  : "text-white/90 hover:text-white"
              }`}
            >
              Sign in
            </a>
            <a
              href="#"
              className="cursor-pointer rounded-xl bg-forest hover:bg-forest-light active:bg-forest-dark text-white text-sm font-medium px-5 py-2.5 transition-colors duration-200"
            >
              List your villa
            </a>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className={`md:hidden cursor-pointer p-2 ${
              isSolid ? "text-charcoal" : "text-white"
            }`}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-linen border-t border-pebble">
          <div className="px-5 py-5 flex flex-col gap-4">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="cursor-pointer text-charcoal text-sm py-1"
              >
                {link.label}
              </a>
            ))}
            <div className="h-px bg-pebble my-1" />
            <a href="#" className="cursor-pointer text-charcoal text-sm py-1">
              Sign in
            </a>
            <a
              href="#"
              className="cursor-pointer rounded-xl bg-forest hover:bg-forest-light text-white text-sm font-medium px-5 py-3 text-center transition-colors duration-200"
            >
              List your villa
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
