import type { Metadata } from "next";
import SubmissionsPageClient from "@/components/admin/submissions/SubmissionsPageClient";
import { createClient } from "@/lib/supabase/server";
import { getVillaSubmissions } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Submissions",
  description:
    "Properties owners have sent in through the public listing form, ready to review, approve, or reject.",
};

export default async function AdminSubmissionsPage() {
  const supabase = await createClient();
  const submissions = await getVillaSubmissions(supabase);

  return (
    <div>
      <h1 className="text-2xl font-medium text-charcoal">Submissions</h1>
      <p className="mt-1 text-sm text-slate">
        Properties owners have sent in through the public listing form.
      </p>

      <SubmissionsPageClient submissions={submissions} />
    </div>
  );
}
