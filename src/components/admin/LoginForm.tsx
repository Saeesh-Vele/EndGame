"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm({
  initialError,
}: {
  initialError?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>(initialError);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pending) return;

    setError(undefined);
    setPending(true);

    const supabase = createClient();

    const { data, error: signInError } = await supabase.auth.signInWithPassword(
      { email: email.trim(), password }
    );

    if (signInError || !data.user) {
      // Supabase returns a deliberately vague message for bad credentials so
      // the form can't be used to probe which emails exist. Keep it that way.
      setError(
        signInError?.message === "Invalid login credentials"
          ? "Wrong email or password."
          : signInError?.message ?? "Couldn't sign you in. Try again."
      );
      setPending(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profile?.is_admin !== true) {
      // Valid credentials, no admin rights: don't leave a usable session
      // sitting in the browser.
      await supabase.auth.signOut();
      setError("Access denied. That account doesn't have admin access.");
      setPassword("");
      setPending(false);
      return;
    }

    // refresh() so the server components behind /admin re-render with the
    // session cookie that was just written.
    router.replace("/admin");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
