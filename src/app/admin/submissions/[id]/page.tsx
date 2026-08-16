import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SubmissionDetailClient from "@/components/admin/submissions/SubmissionDetailClient";
import { createClient } from "@/lib/supabase/server";
import { getVillaSubmissionById } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Villa Submission | StayVilla Admin",
  description:
    "Full detail for a property an owner submitted: contact details, location, capacity, asking price, amenities, and review status.",
};

export default async function AdminSubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const submission = await getVillaSubmissionById(supabase, id);

  if (!submission) notFound();

  return <SubmissionDetailClient submission={submission} />;
}
