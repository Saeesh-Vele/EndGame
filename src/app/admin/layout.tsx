import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "StayVilla Admin",
  description: "Manage villas, bookings, and destinations.",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Belt and suspenders with src/proxy.ts. The proxy already turns away
  // non-admins before this renders, but a layout check means the dashboard
  // can't be served if the proxy is ever misconfigured or bypassed.
  //
  // /admin/login is *not* covered by this layout — it lives in the
  // (admin-auth) route group so it can render without a session.
  const supabase = await createClient();
  const current = await getCurrentUser(supabase);

  if (!current) redirect("/admin/login");
  if (!current.isAdmin) redirect("/admin/login?error=access-denied");

  return (
    <AdminShell email={current.user.email ?? "Signed in"}>
      {children}
    </AdminShell>
  );
}
