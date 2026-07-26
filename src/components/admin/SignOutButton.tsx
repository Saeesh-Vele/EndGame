"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { signOutAction } from "@/app/admin/actions";

export default function SignOutButton({
  compact = false,
  className = "",
}: {
  compact?: boolean;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();

  // signOutAction redirects, so there's no success path to handle here — the
  // pending state simply covers the round trip.
  const handleClick = () => startTransition(() => void signOutAction());

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        aria-label="Sign out"
        className={`cursor-pointer text-white/70 hover:text-white transition-colors duration-200 disabled:opacity-50 ${className}`}
      >
        <LogOut size={16} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className={`cursor-pointer flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors duration-200 disabled:opacity-50 ${className}`}
    >
      <LogOut size={18} />
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
