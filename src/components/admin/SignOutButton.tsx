"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { signOutAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

export default function SignOutButton({
  compact = false,
  className = "",
}: {
  compact?: boolean;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();

  const handleClick = () =>
    startTransition(async () => {
      try {
        await signOutAction();
      } catch (error) {
        // A successful sign-out never reaches here — redirect() unwinds the
        // action. Anything that does is a genuine failure, and without this
        // the button would just stop spinning with the admin still signed in.
        console.error("[admin] sign out failed:", error);
        toast.error(
          "Couldn't sign you out — the server didn't respond. Try again in a moment."
        );
      }
    });

  if (compact) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={handleClick}
        loading={pending}
        aria-label="Sign out"
        className={`min-h-[44px] min-w-[44px] text-white/70 hover:text-white hover:bg-white/10 ${className}`}
      >
        <LogOut size={16} />
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={handleClick}
      loading={pending}
      className={`w-full justify-start gap-3 text-white/70 hover:bg-white/10 hover:text-white ${className}`}
    >
      <LogOut size={18} />
      {pending ? "Signing out…" : "Sign out"}
    </Button>
  );
}

