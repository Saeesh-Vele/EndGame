"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { describeDbError } from "@/lib/errors";

interface SessionContextValue {
  /**
   * The signed-in guest, or null. Anonymous sessions read as null on purpose
   * — the booking flow signs guests in anonymously to satisfy the RLS policy
   * on booking_requests, and none of that should make the navbar say
   * "signed in" or let a heart be saved against an unreachable account.
   */
  user: User | null;
  displayName: string | null;
  loading: boolean;
  /** True once the saved-villa ids have been fetched (or there's no user to
   * fetch them for). Consumers that filter on isSaved need this to avoid
   * rendering an empty list during the first paint. */
  savedReady: boolean;
  isSaved: (villaId: string) => boolean;
  toggleSaved: (villaId: string) => void;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

/** Shared empty set so a signed-out render doesn't allocate a new one. */
const EMPTY_IDS: ReadonlySet<string> = new Set<string>();

export function useSession(): SessionContextValue {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error("useSession must be used inside <SessionProvider>");
  }
  return value;
}

/** Where to come back to after signing in, captured at click time. */
function currentLocation() {
  return `${window.location.pathname}${window.location.search}`;
}

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Saved villas are stamped with the user they belong to rather than cleared
  // by an effect when the user changes. A stale set from a previous session
  // then simply fails the ownership check below and reads as empty.
  const [saved, setSaved] = useState<{
    userId: string;
    ids: Set<string>;
  } | null>(null);

  // onAuthStateChange fires INITIAL_SESSION as soon as it's subscribed, so
  // this covers both the first read and every later change without the extra
  // round trip getUser() would cost. The session is only driving UI here —
  // every authorization decision is made server-side against getUser().
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const next = session?.user ?? null;
      setUser(next && !next.is_anonymous ? next : null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const userId = user?.id ?? null;

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    const load = async () => {
      const { data, error } = await supabase
        .from("saved_villas")
        .select("villa_id");

      if (cancelled) return;

      // On error, settle on an empty set anyway — leaving savedReady false
      // forever would strand the dashboard grid on its fallback. But say so:
      // an empty set renders as "no saved villas yet", which is a lie when the
      // real answer is that the read failed.
      if (error) {
        toast.error(
          describeDbError(error, {
            scope: "saved-villas:load",
            fallback:
              "Couldn't load your saved villas. Reload the page to try again.",
          })
        );
      }

      setSaved({
        userId,
        ids: new Set(
          error ? [] : (data ?? []).map((row) => row.villa_id as string)
        ),
      });
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [userId, supabase]);

  const savedVillaIds = useMemo(
    () => (saved && saved.userId === userId ? saved.ids : EMPTY_IDS),
    [saved, userId]
  );

  const savedReady = userId ? saved?.userId === userId : !loading;

  const isSaved = useCallback(
    (villaId: string) => savedVillaIds.has(villaId),
    [savedVillaIds]
  );

  const toggleSaved = useCallback(
    (villaId: string) => {
      if (!userId) {
        router.push(
          `/auth/login?redirect=${encodeURIComponent(currentLocation())}`
        );
        return;
      }

      const wasSaved = savedVillaIds.has(villaId);

      const flip = (add: boolean) =>
        setSaved((prev) => {
          const base = prev?.userId === userId ? prev.ids : EMPTY_IDS;
          const ids = new Set(base);
          if (add) ids.add(villaId);
          else ids.delete(villaId);
          return { userId, ids };
        });

      // Flip immediately — a heart that waits on a round trip feels broken.
      // Rolled back below if the write fails.
      flip(!wasSaved);

      const run = async () => {
        // The heart flips instantly, but on a dense grid it's easy to miss
        // which card moved. One toast id so rapid toggling replaces rather
        // than stacks.
        const { error } = wasSaved
          ? await supabase
              .from("saved_villas")
              .delete()
              .eq("user_id", userId)
              .eq("villa_id", villaId)
          : await supabase.from("saved_villas").upsert(
              { user_id: userId, villa_id: villaId },
              { onConflict: "user_id,villa_id", ignoreDuplicates: true }
            );

        if (!error) {
          toast.success(
            wasSaved ? "Removed from your saved villas." : "Saved to your villas.",
            { id: "saved-villas", duration: 2000 }
          );
          return;
        }

        // The heart flipped optimistically; put it back and say which way the
        // write failed, so the reverted icon isn't a mystery.
        flip(wasSaved);
        toast.error(
          describeDbError(error, {
            scope: "saved-villas:toggle",
            byCode: {
              "23503": "That villa is no longer listed, so it can't be saved.",
              "42501": "Your session has expired. Sign in again to save villas.",
              PGRST301: "Your session has expired. Sign in again to save villas.",
            },
            fallback: wasSaved
              ? "Couldn't remove that villa from your saved list. Try again."
              : "Couldn't save that villa. Try again.",
          })
        );
      };

      void run();
    },
    [router, savedVillaIds, supabase, userId]
  );

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      // The local session is cleared even when the server call fails, so the
      // UI still signs out — but a failed revoke is worth saying on a shared
      // computer.
      toast.error(
        describeDbError(error, {
          scope: "auth:signout",
          fallback:
            "Signed out on this device, but we couldn't reach the server to end the session everywhere.",
        })
      );
    }

    setSaved(null);

    // Signing out navigates home, which on its own is indistinguishable from
    // a misclick. Say it happened.
    if (!error) toast.success("You're signed out.", { id: "signed-out" });

    // Server components read the session from cookies, so they need to
    // re-render now that it's gone.
    router.refresh();
  }, [router, supabase]);

  const displayName =
    (typeof user?.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : null) ||
    user?.email ||
    null;

  const value = useMemo<SessionContextValue>(
    () => ({
      user,
      displayName,
      loading,
      savedReady,
      isSaved,
      toggleSaved,
      signOut,
    }),
    [user, displayName, loading, savedReady, isSaved, toggleSaved, signOut]
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}
