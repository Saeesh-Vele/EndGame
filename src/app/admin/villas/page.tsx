import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import VillasPageClient from "@/components/admin/villas/VillasPageClient";
import { createClient } from "@/lib/supabase/server";
import {
  getDestinations,
  getVillasForAdmin,
  getWhatsappClickCountsByVilla,
} from "@/lib/supabase/queries";

export default async function AdminVillasPage() {
  const supabase = await createClient();

  // getVillasForAdmin includes inactive villas — the public listing doesn't.
  const [villas, destinations, whatsappClicks] = await Promise.all([
    getVillasForAdmin(supabase),
    getDestinations(supabase),
    getWhatsappClickCountsByVilla(supabase),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-charcoal">Villas</h1>
          <p className="mt-1 text-sm text-slate">
            Manage every villa listed on StayVilla.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/villas/new">
            <Plus size={16} />
            Add villa
          </Link>
        </Button>
      </div>

      <VillasPageClient
        villas={villas}
        destinations={destinations}
        whatsappClicks={whatsappClicks}
      />
    </div>
  );
}
