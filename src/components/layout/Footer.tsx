import { MessageCircle } from "lucide-react";

const columns = [
  {
    title: "Destinations",
    links: ["Goa", "Lonavala", "Udaipur", "Alibaug"],
  },
  {
    title: "Company",
    links: ["About us", "Careers", "List your villa", "Contact"],
  },
  {
    title: "Legal",
    links: ["Terms of service", "Privacy policy", "Cancellation policy"],
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
                  <li key={link}>
                    <a
                      href="#"
                      className="cursor-pointer text-sm transition-colors duration-200 hover:text-white"
                    >
                      {link}
                    </a>
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
              href="#"
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
              href="#"
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
              href="#"
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
