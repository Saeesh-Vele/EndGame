"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
  const pathname = usePathname();
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

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && menuOpen) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

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
      className={`fixed top-0 inset-x-0 z-50 pt-[env(safe-area-inset-top)] transition-all duration-300 ${
        isSolid
          ? "bg-linen/95 backdrop-blur-md border-b border-pebble/60 shadow-xs"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-18 py-4">
          <Link href="/" className="flex items-center gap-2 cursor-pointer group">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              className={`transition-colors duration-200 ${isSolid ? "text-forest" : "text-white"}`}
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
              className={`font-medium text-lg tracking-tight ${
                isSolid ? "text-charcoal" : "text-white"
              }`}
            >
              StayVilla
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {links.map((link) => {
              const active =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`cursor-pointer text-sm font-medium transition-colors duration-200 relative py-1 ${
                    active
                      ? isSolid
                        ? "text-forest font-semibold"
                        : "text-white font-semibold"
                      : linkClass
                  }`}
                >
                  {link.label}
                  {active && (
                    <span
                      className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full ${
                        isSolid ? "bg-forest" : "bg-white"
                      }`}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-6">
            {loading ? (
              <span className="h-9 w-9 rounded-full bg-pebble/50 animate-pulse" aria-hidden />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" aria-label="Account menu" className="cursor-pointer outline-none">
                    <Avatar className={`h-9 w-9 transition-all duration-200 ${
                      isSolid
                        ? "bg-forest text-white hover:bg-forest-light"
                        : "bg-white/90 text-forest hover:bg-white"
                    }`}>
                      <AvatarFallback className="text-xs font-semibold">
                        {initialOf(displayName)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel className="font-normal">
                    <p className="text-sm text-charcoal truncate font-medium">
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
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut size={15} />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/auth/login"
                className={`cursor-pointer text-sm font-medium transition-colors duration-200 ${linkClass}`}
              >
                Sign in
              </Link>
            )}

            <Button asChild size="default">
              <Link href="/list-your-villa">List your villa</Link>
            </Button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setMenuOpen((v) => !v)}
            className={`md:hidden min-h-[44px] min-w-[44px] ${
              isSolid ? "text-charcoal" : "text-white"
            }`}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </Button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-linen/98 backdrop-blur-md border-t border-pebble max-h-[calc(100vh-4.5rem)] overflow-y-auto pb-[max(2rem,env(safe-area-inset-bottom))] shadow-xl">
          <div className="px-5 py-5 flex flex-col gap-4">
            {links.map((link) => {
              const active =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`cursor-pointer text-sm py-1 font-medium ${
                    active ? "text-forest font-semibold" : "text-charcoal"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            <div className="h-px bg-pebble my-1" />

            {loading ? null : user ? (
              <>
                <p className="text-xs text-slate">
                  Signed in as{" "}
                  <span className="text-charcoal font-medium">{displayName}</span>
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
                  className="cursor-pointer flex items-center gap-2.5 text-destructive text-sm py-1 text-left font-medium"
                >
                  <LogOut size={15} className="text-destructive" />
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setMenuOpen(false)}
                className="cursor-pointer text-charcoal text-sm py-1 font-medium"
              >
                Sign in
              </Link>
            )}

            <Button asChild size="lg" className="w-full text-center mt-2">
              <Link href="/list-your-villa" onClick={() => setMenuOpen(false)}>
                List your villa
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}


