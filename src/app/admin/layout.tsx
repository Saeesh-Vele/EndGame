import type { Metadata } from "next";
import { AdminDataProvider } from "@/components/admin/AdminDataProvider";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "StayVilla Admin",
  description: "Manage villas, bookings, and destinations.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminDataProvider>
      <AdminShell>{children}</AdminShell>
    </AdminDataProvider>
  );
}
