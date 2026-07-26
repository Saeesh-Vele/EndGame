"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, MailCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const MIN_PASSWORD = 8;

export default function AuthForm({
  mode,
  redirectTo,
  initialError,
}: {
  mode: "login" | "signup";
  /** Already sanitised by the page — see src/lib/safe-redirect.ts. */
  redirectTo: string;
  initialError?: string;
}) {
  const router = useRouter();
  const isSignup = mode === "signup";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>(initialError);
  const [pending, setPending] = useState(false);
  const [checkInbox, setCheckInbox] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (pending) return;

    setError(undefined);

    if (isSignup && !fullName.trim()) {
      setError("Please tell us your name.");
      return;
    }

    if (isSignup && password.length < MIN_PASSWORD) {
      setError(`Passwords need at least ${MIN_PASSWORD} characters.`);
      return;
    }

    setPending(true);
    const supabase = createClient();

    // A guest who has already sent a booking request is carrying an anonymous
    // session. Clear it before signing in or up so the new session replaces it
    // cleanly instead of layering on top of a throwaway identity.
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user.is_anonymous) {
      await supabase.auth.signOut();
    }

    if (isSignup) {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: fullName.trim() },
          emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(
            redirectTo
          )}`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setPending(false);
        return;
      }

      // No session back means the project requires email confirmation. There
      // is nothing to redirect to yet — the callback route picks it up when
      // they click the link.
      if (!data.session) {
        setCheckInbox(true);
        setPending(false);
        return;
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        // Supabase keeps this message vague so the form can't be used to
        // enumerate which emails have accounts. Keep it that way.
        setError(
          signInError.message === "Invalid login credentials"
            ? "Wrong email or password."
            : signInError.message
        );
        setPending(false);
        return;
      }
    }

    router.replace(redirectTo);
    // Server components read the session from cookies — re-render them now
    // that one exists.
    router.refresh();
  };

  if (checkInbox) {
    return (
      <div className="text-center">
        <MailCheck size={32} className="mx-auto text-forest" />
        <h2 className="mt-4 text-base font-medium text-charcoal">
          Check your inbox
        </h2>
        <p className="mt-2 text-sm text-slate leading-relaxed">
          We&apos;ve sent a confirmation link to{" "}
          <span className="text-charcoal">{email.trim()}</span>. Click it and
          you&apos;ll be signed in.
        </p>
      </div>
    );
  }

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

      {isSignup && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="full-name">Name</Label>
          <Input
            id="full-name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Rhea Menon"
            autoComplete="name"
            required
            disabled={pending}
          />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
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
          autoComplete={isSignup ? "new-password" : "current-password"}
          minLength={isSignup ? MIN_PASSWORD : undefined}
          required
          disabled={pending}
        />
        {isSignup && (
          <p className="text-xs text-slate">
            At least {MIN_PASSWORD} characters.
          </p>
        )}
      </div>

      <Button type="submit" disabled={pending} className="mt-1 w-full">
        {pending && <Loader2 size={16} className="animate-spin" />}
        {pending
          ? isSignup
            ? "Creating account…"
            : "Signing in…"
          : isSignup
            ? "Create account"
            : "Sign in"}
      </Button>
    </form>
  );
}
