"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  ClipboardList,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/villas", label: "Villas", icon: Building2 },
  { href: "/admin/bookings", label: "Bookings", icon: ClipboardList },
  { href: "/admin/destinations", label: "Destinations", icon: MapPin },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href);
}

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
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

        <div className="px-3 py-4 border-t border-white/10">
          <Link
            href="/"
            className="cursor-pointer flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors duration-200"
          >
            <ExternalLink size={18} />
            View site
          </Link>
        </div>
      </aside>

      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between bg-charcoal text-white px-5 py-4">
        <div>
          <p className="text-base font-medium text-white">StayVilla</p>
          <p className="text-xs text-white/50">Admin dashboard</p>
        </div>
        <Link
          href="/"
          className="cursor-pointer text-xs text-white/70 hover:text-white transition-colors duration-200"
        >
          View site
        </Link>
      </header>

      <main className="lg:pl-64 pb-20 lg:pb-0 bg-white min-h-screen">
        <div className="px-5 sm:px-8 py-6 sm:py-8">{children}</div>
      </main>

      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-charcoal border-t border-white/10 flex items-stretch">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`cursor-pointer flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-xs transition-colors duration-200 ${
                active ? "text-white" : "text-white/50"
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Toaster />
    </div>
  );
}
