import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/** Shared page chrome for /auth/login and /auth/signup. */
export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-linen flex flex-col">
      <div className="px-5 sm:px-8 py-6">
        <Link
          href="/"
          className="cursor-pointer inline-flex items-center gap-1.5 text-sm text-slate hover:text-charcoal transition-colors duration-200"
        >
          <ArrowLeft size={15} />
          Back to home
        </Link>
      </div>

      <div className="flex-1 flex items-start sm:items-center justify-center px-5 pb-16">
        <div className="w-full max-w-sm">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.18em] text-slate">
              StayVilla
            </p>
            <h1 className="mt-2 font-display text-4xl text-charcoal">
              {title}
            </h1>
            <p className="mt-2 text-sm text-slate">{subtitle}</p>
          </div>

          <div className="mt-8 rounded-2xl border border-pebble bg-white p-6 sm:p-7">
            {children}
          </div>

          <p className="mt-5 text-center text-sm text-slate">{footer}</p>
        </div>
      </div>
    </div>
  );
}
