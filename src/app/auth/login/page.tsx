import type { Metadata } from "next";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import AuthForm from "@/components/auth/AuthForm";
import { safeRedirect } from "@/lib/safe-redirect";

export const metadata: Metadata = {
  title: "Sign in | StayVilla",
  description: "Sign in to see your booking requests and saved villas.",
};

const ERRORS: Record<string, string> = {
  "link-invalid":
    "That link has expired or has already been used. Sign in with your password instead.",
};

export default async function GuestLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const { redirect, error } = await searchParams;
  const redirectTo = safeRedirect(redirect, "/dashboard");

  const signupHref = `/auth/signup?redirect=${encodeURIComponent(redirectTo)}`;

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Your booking requests and saved villas, in one place."
      footer={
        <>
          New to StayVilla?{" "}
          <Link
            href={signupHref}
            className="cursor-pointer text-forest hover:text-forest-light transition-colors duration-200"
          >
            Create an account
          </Link>
        </>
      }
    >
      <AuthForm
        mode="login"
        redirectTo={redirectTo}
        initialError={error ? ERRORS[error] : undefined}
      />
    </AuthShell>
  );
}
