import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import VillaForm from "@/components/admin/villas/VillaForm";
import { createClient } from "@/lib/supabase/server";
import { getDestinations } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Add Villa",
  description:
    "Create a new villa listing: pricing, capacity, amenities, photos, and the owner's direct contact details.",
};

export default async function NewVillaPage() {
  const supabase = await createClient();
  const destinations = await getDestinations(supabase);

  return (
    <div>
      <Link
        href="/admin/villas"
        className="cursor-pointer inline-flex items-center gap-1.5 text-sm text-slate hover:text-charcoal transition-colors duration-200"
      >
        <ArrowLeft size={15} />
        Back to villas
      </Link>

      <h1 className="mt-3 text-2xl font-medium text-charcoal">Add villa</h1>
      <p className="mt-1 text-sm text-slate">
        Create a new villa listing for StayVilla.
      </p>

      <div className="mt-6">
        <VillaForm destinations={destinations} />
      </div>
    </div>
  );
}
