import { notFound } from "next/navigation";
import SubmissionDetailClient from "@/components/admin/submissions/SubmissionDetailClient";
import { createClient } from "@/lib/supabase/server";
import { getVillaSubmissionById } from "@/lib/supabase/queries";

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
