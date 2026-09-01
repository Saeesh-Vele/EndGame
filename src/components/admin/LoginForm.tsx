"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { describeAuthError, describeDbError } from "@/lib/errors";

export default function LoginForm({
  initialError,
  initialNotice,
}: {
  initialError?: string;
  /** Confirmation carried over from a redirect, e.g. after signing out. */
  initialNotice?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>(initialError);
  const [pending, setPending] = useState(false);
  // Cleared as soon as they start signing in again — a stale "you're signed
  // out" above a half-filled form reads as the current state.
  const [notice, setNotice] = useState<string | undefined>(initialNotice);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pending) return;

    setError(undefined);
    setNotice(undefined);
    setPending(true);

    try {
      const supabase = createClient();

      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({ email: email.trim(), password });

      if (signInError || !data.user) {
        // Supabase returns deliberately vague wording for bad credentials so
        // the form can't be used to probe which emails exist. Keep it that way.
        setError(
          describeAuthError(signInError, {
            scope: "admin:signin",
            fallback: "Couldn't sign you in just now. Try again in a moment.",
          })
        );
        setPending(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", data.user.id)
        .maybeSingle();

      // A failed lookup is not the same as "you're not an admin". Saying
      // "access denied" here sends a real admin off to reset a password that
      // was never the problem.
      if (profileError) {
        await supabase.auth.signOut();
        setError(
          describeDbError(profileError, {
            scope: "admin:profile-lookup",
            fallback:
              "Signed in, but we couldn't check your admin access. Try again in a moment.",
          })
        );
        setPending(false);
        return;
      }

      if (profile?.is_admin !== true) {
        // Valid credentials, no admin rights: don't leave a usable session
        // sitting in the browser.
        await supabase.auth.signOut();
        setError(
          "That account is valid but has no admin access. Ask an existing admin to grant it."
        );
        setPassword("");
        setPending(false);
        return;
      }

      toast.success("Signed in. Welcome back.", { id: "admin-signed-in" });

      // refresh() so the server components behind /admin re-render with the
      // session cookie that was just written.
      router.replace("/admin");
      router.refresh();
    } catch (thrown) {
      setError(
        describeAuthError(thrown, {
          scope: "admin:signin",
          fallback:
            "Something went wrong reaching the sign-in service. Try again in a moment.",
        })
      );
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {notice && !error && (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-xl border border-forest/25 bg-forest/5 px-3.5 py-3 text-sm font-medium text-forest"
        >
          <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-destructive/25 bg-destructive/5 px-3.5 py-3 text-sm text-destructive"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@stayvilla.in"
          autoComplete="email"
          required
          disabled={pending}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          required
          disabled={pending}
        />
      </div>

      <Button type="submit" disabled={pending} className="mt-1 w-full">
        {pending && <Loader2 size={16} className="animate-spin" />}
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
