"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, LogOut, Menu, ClipboardList, User, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/components/shared/SessionProvider";

const links = [
  { label: "Villas", href: "/villas" },
  { label: "Destinations", href: "/#destinations" },
  { label: "About", href: "/about" },
];

const ACCOUNT_LINKS = [
  { label: "My bookings", href: "/dashboard#bookings", icon: ClipboardList },
  { label: "Saved villas", href: "/dashboard#saved", icon: Heart },
];

function initialOf(name: string | null) {
  return name?.trim()?.[0]?.toUpperCase() ?? "?";
}

export default function Navbar({
  transparent = true,
}: {
  transparent?: boolean;
}) {
  const router = useRouter();
  const { user, displayName, loading, signOut } = useSession();
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

  const handleSignOut = async () => {
    setMenuOpen(false);
    await signOut();
    router.push("/");
  };

  const linkClass = isSolid
    ? "text-charcoal hover:text-forest"
    : "text-white/90 hover:text-white";

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-200 ${
        isSolid ? "bg-linen/95 backdrop-blur-sm shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-18 py-4">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
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
              <Link
                key={link.label}
                href={link.href}
                className={`cursor-pointer text-sm font-normal transition-colors duration-200 ${linkClass}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-6">
            {/* Nothing until the session resolves — better a beat of empty
                space than "Sign in" flashing at someone who is signed in. */}
            {loading ? (
              <span className="h-9 w-9" aria-hidden />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Account menu"
                    className={`cursor-pointer flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors duration-200 ${
                      isSolid
                        ? "bg-forest text-white hover:bg-forest-light"
                        : "bg-white/90 text-forest hover:bg-white"
                    }`}
                  >
                    {initialOf(displayName)}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel className="font-normal">
                    <p className="text-sm text-charcoal truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-slate truncate">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {ACCOUNT_LINKS.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className="cursor-pointer">
                        <item.icon size={15} />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard#profile" className="cursor-pointer">
                      <User size={15} />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={handleSignOut}
                    className="cursor-pointer"
                  >
                    <LogOut size={15} />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/auth/login"
                className={`cursor-pointer text-sm transition-colors duration-200 ${linkClass}`}
              >
                Sign in
              </Link>
            )}

            <Link
              href="/list-your-villa"
              className="cursor-pointer rounded-xl bg-forest hover:bg-forest-light active:bg-forest-dark text-white text-sm font-medium px-5 py-2.5 transition-colors duration-200"
            >
              List your villa
            </Link>
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
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="cursor-pointer text-charcoal text-sm py-1"
              >
                {link.label}
              </Link>
            ))}

            <div className="h-px bg-pebble my-1" />

            {loading ? null : user ? (
              <>
                <p className="text-xs text-slate">
                  Signed in as{" "}
                  <span className="text-charcoal">{displayName}</span>
                </p>
                {ACCOUNT_LINKS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="cursor-pointer flex items-center gap-2.5 text-charcoal text-sm py-1"
                  >
                    <item.icon size={15} className="text-slate" />
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/dashboard#profile"
                  onClick={() => setMenuOpen(false)}
                  className="cursor-pointer flex items-center gap-2.5 text-charcoal text-sm py-1"
                >
                  <User size={15} className="text-slate" />
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="cursor-pointer flex items-center gap-2.5 text-charcoal text-sm py-1 text-left"
                >
                  <LogOut size={15} className="text-slate" />
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setMenuOpen(false)}
                className="cursor-pointer text-charcoal text-sm py-1"
              >
                Sign in
              </Link>
            )}

            <Link
              href="/list-your-villa"
              onClick={() => setMenuOpen(false)}
              className="cursor-pointer rounded-xl bg-forest hover:bg-forest-light text-white text-sm font-medium px-5 py-3 text-center transition-colors duration-200"
            >
              List your villa
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
