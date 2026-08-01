"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import VillasTable from "@/components/admin/villas/VillasTable";
import { Destination, Villa } from "@/types";

/**
 * Holds the search/filter state for the villas screen. The data itself is
 * fetched on the server in src/app/admin/villas/page.tsx — this only narrows
 * what's already loaded.
 */
export default function VillasPageClient({
  villas,
  destinations,
  whatsappClicks,
}: {
  villas: Villa[];
  destinations: Destination[];
  /** Total WhatsApp link clicks, keyed by villa id. */
  whatsappClicks: Record<string, number>;
}) {
  const [search, setSearch] = useState("");
  const [destinationFilter, setDestinationFilter] = useState("all");

  const filtered = useMemo(() => {
    return villas.filter((villa) => {
      if (
        destinationFilter !== "all" &&
        villa.destination !== destinationFilter
      ) {
        return false;
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        return (
          villa.name.toLowerCase().includes(q) ||
          villa.location.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [villas, search, destinationFilter]);

  return (
    <>
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or location"
            className="pl-9"
          />
        </div>

        <Select value={destinationFilter} onValueChange={setDestinationFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Destination" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All destinations</SelectItem>
            {destinations.map((d) => (
              <SelectItem key={d.id} value={d.name}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="mt-4 text-sm text-slate">
        {filtered.length} {filtered.length === 1 ? "villa" : "villas"}
      </p>

      <div className="mt-3">
        <VillasTable villas={filtered} whatsappClicks={whatsappClicks} />
      </div>
    </>
  );
}
