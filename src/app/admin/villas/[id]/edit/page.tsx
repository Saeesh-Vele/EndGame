import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import VillaForm from "@/components/admin/villas/VillaForm";
import { createClient } from "@/lib/supabase/server";
import { getDestinations, getVillaById } from "@/lib/supabase/queries";

export default async function EditVillaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [villa, destinations] = await Promise.all([
    getVillaById(supabase, id),
    getDestinations(supabase),
  ]);

  if (!villa) notFound();

  return (
    <div>
      <Link
        href="/admin/villas"
        className="cursor-pointer inline-flex items-center gap-1.5 text-sm text-slate hover:text-charcoal transition-colors duration-200"
      >
        <ArrowLeft size={15} />
        Back to villas
      </Link>

      <h1 className="mt-3 text-2xl font-medium text-charcoal">
        Edit {villa.name}
      </h1>
      <p className="mt-1 text-sm text-slate">
        Update this villa&apos;s details.
      </p>

      <div className="mt-6">
        <VillaForm villa={villa} destinations={destinations} />
      </div>
    </div>
  );
}
