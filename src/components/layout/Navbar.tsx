"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

  const panelRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const MENU_ID = "mobile-nav";

  /**
   * `returnFocus` is false when a link closed the menu — the page is about to
   * change and pulling focus back to the hamburger would fight the navigation.
   * Escape and outside-click pass true so a keyboard user lands back on the
   * control they opened.
   */
  const closeMenu = useCallback((returnFocus = false) => {
    setMenuOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

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

  // Escape closes and hands focus back to the trigger. Tab is cycled through
  // the trigger plus the panel's own controls so focus can't wander into the
  // page behind an open menu.
  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMenu(true);
        return;
      }
      if (e.key !== "Tab") return;

      const panel = panelRef.current;
      const trigger = triggerRef.current;
      if (!panel || !trigger) return;

      const items = [
        trigger,
        ...Array.from(
          panel.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ),
      ];
      const index = items.indexOf(document.activeElement as HTMLElement);
      if (index === -1) return;

      const next = e.shiftKey
        ? items[(index - 1 + items.length) % items.length]
        : items[(index + 1) % items.length];

      e.preventDefault();
      next.focus();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen, closeMenu]);

  // Outside click. Pointerdown rather than click so a drag that starts outside
  // still dismisses, and the trigger is excluded so it keeps toggling.
  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      closeMenu(true);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [menuOpen, closeMenu]);

  // Links in the panel close it themselves; browser back/forward does not go
  // through them, so listen for popstate. Closing from an event callback
  // rather than an effect body also keeps react-hooks/set-state-in-effect happy.
  useEffect(() => {
    if (!menuOpen) return;
    const handlePopState = () => closeMenu(false);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [menuOpen, closeMenu]);

  // Move focus into the panel when it opens, so a keyboard user is not left
  // on the trigger with the menu silently open behind them.
  useEffect(() => {
    if (!menuOpen) return;
    const first = panelRef.current?.querySelector<HTMLElement>("a[href], button");
    first?.focus();
  }, [menuOpen]);

  const isSolid = !transparent || scrolled || menuOpen;

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
      className="fixed top-0 inset-x-0 z-50"
    >
      <div
        className={`relative z-10 pt-[env(safe-area-inset-top)] transition-all duration-300 ${
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
            ref={triggerRef}
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => (menuOpen ? closeMenu(false) : setMenuOpen(true))}
            className={`md:hidden min-h-[44px] min-w-[44px] ${
              isSolid ? "text-charcoal" : "text-white"
            }`}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls={MENU_ID}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </Button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <>
          {/* Dimmed backdrop: the visible affordance for "tap anywhere to
              close", and a target for pointer users who never press Escape.
              Sits under the bar and the panel, both of which are z-10. */}
          <div
            className="md:hidden fixed inset-0 z-0 bg-charcoal/40 backdrop-blur-xs"
            onClick={() => closeMenu(true)}
            aria-hidden="true"
          />
          <nav
            id={MENU_ID}
            ref={panelRef}
            aria-label="Mobile"
            className="relative z-10 md:hidden bg-linen/98 backdrop-blur-md border-t border-pebble max-h-[calc(100vh-4.5rem)] overflow-y-auto pb-[max(2rem,env(safe-area-inset-bottom))] shadow-xl">
          <div className="px-5 py-5 flex flex-col gap-4">
            {links.map((link) => {
              const active =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => closeMenu(false)}
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
                    onClick={() => closeMenu(false)}
                    className="cursor-pointer flex items-center gap-2.5 text-charcoal text-sm py-1"
                  >
                    <item.icon size={15} className="text-slate" />
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/dashboard#profile"
                  onClick={() => closeMenu(false)}
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
                onClick={() => closeMenu(false)}
                className="cursor-pointer text-charcoal text-sm py-1 font-medium"
              >
                Sign in
              </Link>
            )}

            <Button asChild size="lg" className="w-full text-center mt-2">
              <Link href="/list-your-villa" onClick={() => closeMenu(false)}>
                List your villa
              </Link>
            </Button>
          </div>
          </nav>
        </>
      )}
    </header>
  );
}


