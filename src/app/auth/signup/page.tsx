import type { Metadata } from "next";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import AuthForm from "@/components/auth/AuthForm";
import { safeRedirect } from "@/lib/safe-redirect";

export const metadata: Metadata = {
  title: "Create an Account",
  description:
    "Create a StayVilla account to save villas and keep track of your booking requests.",
};

export default async function GuestSignupPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;
  const redirectTo = safeRedirect(redirect, "/dashboard");

  const loginHref = `/auth/login?redirect=${encodeURIComponent(redirectTo)}`;

  return (
    <AuthShell
      title="Create an account"
      subtitle="Save villas you like and keep your requests in one place."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href={loginHref}
            className="cursor-pointer text-forest hover:text-forest-light transition-colors duration-200"
          >
            Sign in
          </Link>
        </>
      }
    >
      <AuthForm mode="signup" redirectTo={redirectTo} />
    </AuthShell>
  );
}
