"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

/**
 * Confirmations for things that finish with a redirect.
 *
 * A Server Action or Route Handler that redirects has no way to hand the next
 * page a message — email confirmation and both sign-out flows used to land
 * somewhere new with nothing said at all. They now redirect with `?notice=`,
 * and this reads it, announces it, and strips it from the URL so a refresh or
 * a back-button press doesn't replay the toast.
 *
 * Mounted once in the root layout, so any route can use it.
 */
/**
 * Only the keys listed here are handled. A `notice` this doesn't recognise is
 * left in the URL untouched — it belongs to a page that renders the message
 * itself (the admin login page does this for sign-out, where a banner in the
 * card beats a toast that fades while you're deciding whether to sign back
 * in).
 */
const NOTICES: Record<string, string> = {
  "email-confirmed": "Email confirmed — you're signed in.",
  "signed-out": "You're signed out.",
};

export default function FlashNotice() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const announced = useRef<string | null>(null);

  const notice = params.get("notice");

  useEffect(() => {
    if (!notice || announced.current === notice) return;
    announced.current = notice;

    const message = NOTICES[notice];
    if (!message) return;

    // A stable id keeps a double-invoked effect (StrictMode) from stacking
    // two identical toasts.
    toast.success(message, { id: `notice-${notice}` });

    const next = new URLSearchParams(params);
    next.delete("notice");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [notice, params, pathname, router]);

  return null;
}
