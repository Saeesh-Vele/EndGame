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
  ShieldCheck,
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
    <div className="min-h-screen bg-sandstone/20">
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 bg-charcoal text-white shadow-lg">
        <div className="px-6 py-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-white tracking-wide">StayVilla</p>
            <p className="text-[11px] font-semibold text-white/50 uppercase tracking-widest mt-0.5">
              Admin Portal
            </p>
          </div>
          <ShieldCheck size={20} className="text-forest shrink-0" />
        </div>

        <nav className="flex-1 px-3 py-5 flex flex-col gap-1.5">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`cursor-pointer flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150 ${
                  active
                    ? "bg-forest text-white shadow-xs font-semibold"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.icon size={18} className={active ? "text-white" : "text-white/60"} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/10 flex flex-col gap-2">
          <Link
            href="/"
            className="cursor-pointer flex items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors duration-150"
          >
            <ExternalLink size={16} />
            View Public Website
          </Link>

          <div className="px-3 pt-3 border-t border-white/10">
            <p className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">
              Admin Session
            </p>
            <p className="mt-0.5 text-xs font-medium text-white/90 truncate" title={email}>
              {email}
            </p>
          </div>

          <SignOutButton className="mt-1" />
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between bg-charcoal text-white px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-4 shadow-md">
        <div className="min-w-0">
          <p className="text-base font-bold text-white tracking-wide">StayVilla Admin</p>
          <p className="text-xs text-white/60 truncate">{email}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/"
            className="cursor-pointer text-xs font-medium text-white/80 hover:text-white transition-colors duration-150"
          >
            View site
          </Link>
          <SignOutButton compact />
        </div>
      </header>

      {/* Main Operations Area */}
      <main className="lg:pl-64 pb-[max(6rem,calc(env(safe-area-inset-bottom)+5rem))] lg:pb-12 min-h-screen">
        <div className="px-5 sm:px-8 py-6 sm:py-10 max-w-7xl mx-auto">{children}</div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-charcoal border-t border-white/10 flex items-stretch pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-xl">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`cursor-pointer flex-1 min-w-0 flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors duration-150 ${
                active ? "text-white font-semibold bg-white/5" : "text-white/50 hover:text-white/80"
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

