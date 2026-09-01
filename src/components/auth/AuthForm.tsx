"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle, MailCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { describeAuthError } from "@/lib/errors";

const MIN_PASSWORD = 8;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type AuthField = "fullName" | "email" | "password";

/** Message under a single input. Renders nothing when the field is fine. */
function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;

  return (
    <p
      id={id}
      role="alert"
      className="flex items-start gap-1.5 text-xs font-medium text-destructive"
    >
      <AlertCircle size={13} className="mt-px shrink-0" />
      <span>{message}</span>
    </p>
  );
}

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
  /** Failures that don't belong to one input: a rejected sign-in, a
   *  dropped connection, the expired-link message from /auth/callback. */
  const [error, setError] = useState<string | undefined>(initialError);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<AuthField, string>>
  >({});
  const [pending, setPending] = useState(false);
  const [checkInbox, setCheckInbox] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const refs: Record<AuthField, React.RefObject<HTMLInputElement | null>> = {
    fullName: nameRef,
    email: emailRef,
    password: passwordRef,
  };

  const clearFieldError = (field: AuthField) =>
    setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));

  const showFieldError = (field: AuthField, message: string) => {
    setFieldErrors({ [field]: message });
    refs[field].current?.focus();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (pending) return;

    setError(undefined);

    // Field-level checks first, each naming the input it belongs to.
    if (isSignup && !fullName.trim()) {
      showFieldError("fullName", "Tell us your name so hosts know who's asking.");
      return;
    }

    if (!email.trim()) {
      showFieldError("email", "Enter the email address on your account.");
      return;
    }

    if (isSignup && !EMAIL.test(email.trim())) {
      showFieldError("email", "That email doesn't look right — check for a typo.");
      return;
    }

    if (!password) {
      showFieldError("password", "Enter your password.");
      return;
    }

    if (isSignup && password.length < MIN_PASSWORD) {
      showFieldError(
        "password",
        `Passwords need at least ${MIN_PASSWORD} characters.`
      );
      return;
    }

    setFieldErrors({});
    setPending(true);

    try {
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
          const message = describeAuthError(signUpError, {
            scope: "auth:signup",
            fallback:
              "We couldn't create your account just now. Try again in a moment.",
          });

          // Weak or already-used credentials belong on the input that owns
          // them, not in a banner above the whole form.
          if (signUpError.code === "weak_password") {
            showFieldError("password", message);
          } else if (
            signUpError.code === "user_already_exists" ||
            signUpError.code === "email_exists" ||
            signUpError.code === "email_address_invalid" ||
            signUpError.code === "validation_failed"
          ) {
            showFieldError("email", message);
          } else {
            setError(message);
          }

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
          // Supabase keeps bad-credential wording vague so the form can't be
          // used to enumerate which emails have accounts. Keep it that way.
          setError(
            describeAuthError(signInError, {
              scope: "auth:signin",
              fallback: "We couldn't sign you in just now. Try again in a moment.",
            })
          );
          setPending(false);
          return;
        }
      }

      // Fired before navigating: the toaster lives in the root layout, so it
      // survives the route change, and the destination (a villa page, the
      // dashboard) otherwise gives no sign that signing in is what happened.
      toast.success(
        isSignup ? "Account created — you're signed in." : "Signed in — welcome back.",
        { id: "signed-in" }
      );

      router.replace(redirectTo);
      // Server components read the session from cookies — re-render them now
      // that one exists.
      router.refresh();
    } catch (thrown) {
      // supabase-js returns most failures rather than throwing, but a dropped
      // connection or a blocked request still lands here — without this the
      // form would sit spinning with nothing said.
      setError(
        describeAuthError(thrown, {
          scope: isSignup ? "auth:signup" : "auth:signin",
          fallback:
            "Something went wrong reaching our sign-in service. Try again in a moment.",
        })
      );
      setPending(false);
    }
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
            ref={nameRef}
            id="full-name"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              clearFieldError("fullName");
            }}
            placeholder="Rhea Menon"
            autoComplete="name"
            aria-invalid={Boolean(fieldErrors.fullName)}
            aria-describedby={fieldErrors.fullName ? "full-name-error" : undefined}
            required
            disabled={pending}
          />
          <FieldError id="full-name-error" message={fieldErrors.fullName} />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          ref={emailRef}
          id="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearFieldError("email");
          }}
          placeholder="you@example.com"
          autoComplete="email"
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? "email-error" : undefined}
          required
          disabled={pending}
        />
        <FieldError id="email-error" message={fieldErrors.email} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          ref={passwordRef}
          id="password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            clearFieldError("password");
          }}
          placeholder="••••••••"
          autoComplete={isSignup ? "new-password" : "current-password"}
          minLength={isSignup ? MIN_PASSWORD : undefined}
          aria-invalid={Boolean(fieldErrors.password)}
          aria-describedby={fieldErrors.password ? "password-error" : undefined}
          required
          disabled={pending}
        />
        <FieldError id="password-error" message={fieldErrors.password} />
        {isSignup && (
          <p className="text-xs text-slate">
            At least {MIN_PASSWORD} characters.
          </p>
        )}
      </div>

      <Button type="submit" loading={pending} className="mt-1 w-full">
        {isSignup ? "Create account" : "Sign in"}
      </Button>
    </form>
  );
}

