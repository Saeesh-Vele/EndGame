"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  ClipboardList,
  Inbox,
  MapPin,
  ExternalLink,
} from "lucide-react";
import SignOutButton from "@/components/admin/SignOutButton";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/villas", label: "Villas", icon: Building2 },
  { href: "/admin/bookings", label: "Bookings", icon: ClipboardList },
  { href: "/admin/submissions", label: "Submissions", icon: Inbox },
  { href: "/admin/destinations", label: "Destinations", icon: MapPin },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href);
}

export default function AdminShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email: string;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-white">
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 bg-charcoal text-white">
        <div className="px-6 py-6 border-b border-white/10">
          <p className="text-lg font-medium text-white">StayVilla</p>
          <p className="text-xs text-white/50 mt-0.5">Admin dashboard</p>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`cursor-pointer flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-200 ${
                  active
                    ? "bg-forest text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/10 flex flex-col gap-1">
          <Link
            href="/"
            className="cursor-pointer flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors duration-200"
          >
            <ExternalLink size={18} />
            View site
          </Link>

          <div className="mt-2 px-3 pt-3 border-t border-white/10">
            <p className="text-[11px] uppercase tracking-wider text-white/40">
              Signed in as
            </p>
            <p className="mt-0.5 text-xs text-white/80 truncate" title={email}>
              {email}
            </p>
          </div>

          <SignOutButton className="mt-2" />
        </div>
      </aside>

      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between bg-charcoal text-white px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-4 shadow-sm">
        <div className="min-w-0">
          <p className="text-base font-semibold text-white">StayVilla</p>
          <p className="text-xs text-white/60 truncate">{email}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/"
            className="cursor-pointer text-xs font-medium text-white/70 hover:text-white transition-colors duration-200"
          >
            View site
          </Link>
          <SignOutButton compact />
        </div>
      </header>

      <main className="lg:pl-64 pb-[max(6rem,calc(env(safe-area-inset-bottom)+5rem))] lg:pb-12 bg-white min-h-screen">
        <div className="px-5 sm:px-8 py-6 sm:py-8">{children}</div>
      </main>

      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-charcoal border-t border-white/10 flex items-stretch pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-xl">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`cursor-pointer flex-1 min-w-0 flex flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors duration-200 ${
                active ? "text-white font-semibold" : "text-white/50 hover:text-white/80"
              }`}
            >
              <item.icon size={20} className={active ? "text-forest" : "text-white/50"} />
              <span className="max-w-full truncate px-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
