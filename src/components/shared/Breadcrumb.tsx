import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumb({
  items,
  className = "",
}: {
  items: BreadcrumbItem[];
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-xs text-slate ${className}`}>
      <ol className="flex items-center flex-wrap gap-1.5">
        <li className="flex items-center gap-1.5">
          <Link
            href="/"
            className="flex items-center gap-1 text-slate hover:text-forest transition-colors duration-200"
          >
            <Home size={14} className="shrink-0" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-1.5">
              <ChevronRight size={12} className="text-slate/50 shrink-0" />
              {isLast || !item.href ? (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className="font-medium text-charcoal truncate max-w-[200px] sm:max-w-[320px]"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-slate hover:text-forest transition-colors duration-200"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
