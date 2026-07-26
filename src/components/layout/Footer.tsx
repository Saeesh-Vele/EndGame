import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { SITE_SOCIAL, whatsappHref } from "@/lib/site";

// Destination slugs are hardcoded rather than fetched: the footer renders on
// every page including ones that don't otherwise touch the database, and these
// four are the launch set. If a slug is renamed in the admin, /villas simply
// ignores an unknown ?destination and shows everything.
const columns: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Destinations",
    links: [
      { label: "Goa", href: "/villas?destination=goa" },
      { label: "Lonavala", href: "/villas?destination=lonavala" },
      { label: "Udaipur", href: "/villas?destination=udaipur" },
      { label: "Alibaug", href: "/villas?destination=alibaug" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About us", href: "/about" },
      { label: "List your villa", href: "/list-your-villa" },
      { label: "Contact", href: "/about#contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of service", href: "/terms" },
      { label: "Privacy policy", href: "/privacy" },
      { label: "Cancellation policy", href: "/cancellation-policy" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-charcoal text-white/70">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <span className="font-medium text-lg text-white">StayVilla</span>
            <p className="mt-3 text-sm leading-relaxed max-w-xs">
              Handpicked private villas across India. Full privacy, no shared
              walls, just you and the view.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-medium text-white mb-4">
                {col.title}
              </h3>
              <ul className="flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="cursor-pointer text-sm transition-colors duration-200 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">
            © {new Date().getFullYear()} StayVilla. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href={SITE_SOCIAL.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="cursor-pointer transition-colors duration-200 hover:text-white"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
              </svg>
            </a>
            <a
              href={SITE_SOCIAL.x}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X"
              className="cursor-pointer transition-colors duration-200 hover:text-white"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 4L20 20M20 4L4 20"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </a>
            <a
              href={whatsappHref("Hi StayVilla, I have a question.")}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="cursor-pointer transition-colors duration-200 hover:text-white"
            >
              <MessageCircle size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
